import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Refresh the access token using the refresh_token
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }
  return { access_token: data.access_token, expires_in: data.expires_in };
}

// Get or create the _app_storage root folder on Drive
async function getOrCreateRootFolder(
  accessToken: string,
  supabase: ReturnType<typeof createClient>,
  integrationId: string,
  existingRootFolderId: string | null
): Promise<string> {
  if (existingRootFolderId) {
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${existingRootFolderId}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (checkRes.ok) {
      const file = await checkRes.json();
      if (!file.trashed) return existingRootFolderId;
    } else {
      await checkRes.text();
    }
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      "name='_app_storage' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false"
    )}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();
  if (searchData.files?.length > 0) {
    const folderId = searchData.files[0].id;
    await supabase
      .from("organization_integrations")
      .update({ root_folder_id: folderId, root_folder_name: "_app_storage" })
      .eq("id", integrationId);
    return folderId;
  }

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "_app_storage",
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const created = await createRes.json();
  await supabase
    .from("organization_integrations")
    .update({ root_folder_id: created.id, root_folder_name: "_app_storage" })
    .eq("id", integrationId);
  return created.id;
}

// Get or create a sub-folder inside a parent
async function getOrCreateSubFolder(
  accessToken: string,
  parentId: string,
  folderName: string
): Promise<string> {
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    )}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();
  if (searchData.files?.length > 0) return searchData.files[0].id;

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  const created = await createRes.json();
  return created.id;
}

// Create or update a Google Doc (for text_display items)
async function createOrUpdateLinkDoc(
  accessToken: string,
  folderId: string,
  title: string,
  appUrl: string,
  entityTypeName: string,
  existingFileId: string | null
): Promise<string> {
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:24px;">
<h2>${title}</h2>
<p style="color:#666;margin-bottom:16px;">Type: ${entityTypeName}</p>
<p style="font-size:16px;"><a href="${appUrl}" style="color:#1a73e8;text-decoration:underline;">📎 Open in App</a></p>
<br/><hr style="border:none;border-top:1px solid #e0e0e0;"/>
<p style="color:#999;font-size:12px;">This document is a link to the application. Click the link above to view the full content.</p>
</body></html>`;

  if (existingFileId) {
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${existingFileId}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const fileStillExists = checkRes.ok && !(await checkRes.json()).trashed;

    if (fileStillExists) {
      const boundary = "multipart_boundary";
      const metadata = JSON.stringify({ name: title });
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
        `--${boundary}--`;

      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
      const data = await res.json();
      return data.id;
    }
    console.log(`Existing file ${existingFileId} was deleted from Drive, creating fresh`);
  }

  const boundary = "multipart_boundary";
  const metadata = JSON.stringify({
    name: title,
    mimeType: "application/vnd.google-apps.document",
    parents: [folderId],
  });
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  const data = await res.json();
  if (!data.id) {
    throw new Error(`Failed to create link document: ${JSON.stringify(data)}`);
  }
  return data.id;
}

// ─── PDF Export via temp Google Doc ───

// Build checklist HTML with inline styles
function buildChecklistHtml(
  checklist: { title: string; description: string | null; display_mode: string },
  sections: Array<{
    id: string;
    title: string;
    display_mode: string;
    image_url: string | null;
    items: Array<{
      id: string;
      text: string;
      parent_item_id: string | null;
      sort_order: number;
      item_type: string;
    }>;
  }>,
  logoUrl: string | null,
  accentColor: string
): string {
  function renderItems(
    items: typeof sections[0]["items"],
    parentId: string | null,
    depth: number,
    isNumbered: boolean
  ): string {
    const children = items
      .filter((i) => i.parent_item_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);

    return children
      .map((item, index) => {
        const marginLeft = depth * 24;
        const marker = isNumbered
          ? `<span style="flex-shrink:0;margin-top:2px;font-weight:500;font-size:14px;min-width:24px;">${
              depth === 0 ? `${index + 1}.` : `${String.fromCharCode(65 + index)}.`
            }</span>`
          : `<div style="flex-shrink:0;margin-top:2px;width:20px;height:20px;min-width:20px;min-height:20px;border:2px solid black;background:white;border-radius:4px;"></div>`;

        const nested = renderItems(items, item.id, depth + 1, isNumbered);

        return `<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid #e5e5e5;margin-left:${marginLeft}px;">
${marker}
<div style="flex:1;"><span style="font-size:14px;">${escapeHtml(item.text)}</span></div>
</div>
${nested}`;
      })
      .join("");
  }

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="height:64px;width:auto;" />`
    : `<div style="height:64px;width:64px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">Logo</div>`;

  let sectionsHtml = "";
  for (const section of sections) {
    const isNumbered = section.display_mode === "numbered";
    const itemsHtml = renderItems(section.items, null, 0, isNumbered);

    const imageHtml = section.image_url
      ? `<div style="margin-bottom:12px;padding-left:8px;"><img src="${section.image_url}" alt="${escapeHtml(section.title)}" style="max-height:192px;border:1px solid #e5e5e5;" /></div>`
      : "";

    sectionsHtml += `<div style="margin-bottom:24px;">
<div style="font-weight:600;font-size:16px;padding:8px 12px;margin-bottom:8px;background:#f5f5f5;border-left:4px solid ${accentColor};">
${escapeHtml(section.title)}
</div>
${imageHtml}
<div style="padding-left:8px;">
${itemsHtml}
</div>
</div>`;
  }

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:0.5in;color:#1a1a1a;">
<div style="display:flex;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid black;">
<div style="flex-shrink:0;">${logoHtml}</div>
<div style="flex:1;text-align:center;"><h1 style="font-size:24px;font-weight:700;margin:0;">${escapeHtml(checklist.title)}</h1></div>
<div style="flex-shrink:0;width:64px;"></div>
</div>
${sectionsHtml}
</body></html>`;
}

// Build gemba doc (SOP) HTML with inline styles
function buildGembaDocHtml(
  doc: { title: string; description: string | null; grid_columns: number; grid_rows: number },
  pages: Array<{
    page_number: number;
    cells: Array<{
      position: number;
      image_url: string | null;
      step_number: string | null;
      step_text: string | null;
    }>;
  }>,
  logoUrl: string | null,
  accentColor: string
): string {
  let pagesHtml = "";

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const totalCells = doc.grid_rows * doc.grid_columns;

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Logo" style="position:absolute;left:0;top:50%;transform:translateY(-50%);height:64px;width:auto;" />`
      : "";

    const titleHtml =
      pageIndex === 0
        ? `<div style="text-align:center;">
<h1 style="font-size:2rem;font-weight:700;margin:0;color:#111;">${escapeHtml(doc.title)}</h1>
${doc.description ? `<p style="font-size:1rem;color:#666;margin:6px 0 0;">${escapeHtml(doc.description)}</p>` : ""}
</div>`
        : "";

    // Build grid cells using an HTML table for reliable PDF rendering
    let tableRows = "";
    for (let row = 0; row < doc.grid_rows; row++) {
      let cells = "";
      for (let col = 0; col < doc.grid_columns; col++) {
        const pos = row * doc.grid_columns + col;
        const cell = page.cells.find((c) => c.position === pos);
        const stepNumber = pos + 1;
        const hasImage = !!cell?.image_url;

        if (!hasImage) {
          cells += `<td style="border:none;padding:4px;vertical-align:top;"></td>`;
        } else {
          cells += `<td style="border:none;padding:4px;vertical-align:top;">
<div style="position:relative;overflow:hidden;border-radius:8px;">
<div style="position:absolute;top:8px;left:8px;background:${accentColor};color:#fff;min-width:2rem;height:2rem;padding:0 8px;font-weight:700;font-size:14px;border-radius:6px;display:flex;align-items:center;justify-content:center;z-index:1;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${stepNumber}</div>
<img src="${cell.image_url}" alt="Step ${stepNumber}" style="width:100%;height:auto;border-radius:8px;display:block;" />
</div>
<p style="font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;line-height:1.3;color:#333;margin:0;padding:4px 6px;min-height:20px;">${escapeHtml(cell?.step_text || "")}</p>
</td>`;
        }
      }
      tableRows += `<tr>${cells}</tr>`;
    }

    pagesHtml += `<div style="padding:6px;${pageIndex < pages.length - 1 ? "page-break-after:always;" : ""}">
<div style="position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:8px;padding-bottom:4px;min-height:64px;">
${logoHtml}
${titleHtml}
<span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:1.25rem;font-weight:700;color:${accentColor};background:${accentColor}26;border-radius:8px;padding:4px 8px;min-width:2rem;text-align:center;">${page.page_number}</span>
</div>
<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
${tableRows}
</table>
</div>`;
  }

  return `<!DOCTYPE html><html><body style="font-family:system-ui,Arial,sans-serif;margin:0;padding:0;color:#1a1a1a;">
${pagesHtml}
</body></html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Upload HTML as temp Google Doc, export as PDF, upload PDF, delete temp doc
async function createPdfFromHtml(
  accessToken: string,
  folderId: string,
  title: string,
  html: string,
  existingFileId: string | null
): Promise<string> {
  // If there's an existing PDF, check if it still exists to delete it
  if (existingFileId) {
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${existingFileId}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (checkRes.ok) {
      const file = await checkRes.json();
      if (!file.trashed) {
        // Delete the old PDF so we can create a fresh one
        await fetch(`https://www.googleapis.com/drive/v3/files/${existingFileId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    }
  }

  // Step 1: Create a temporary Google Doc from HTML
  const boundary = "pdf_boundary";
  const tempMetadata = JSON.stringify({
    name: `_temp_${title}`,
    mimeType: "application/vnd.google-apps.document",
    parents: [folderId],
  });
  const tempBody =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${tempMetadata}\r\n` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
    `--${boundary}--`;

  const tempRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: tempBody,
    }
  );
  const tempDoc = await tempRes.json();
  if (!tempDoc.id) {
    throw new Error(`Failed to create temp doc: ${JSON.stringify(tempDoc)}`);
  }

  // Step 2: Export the temp doc as PDF
  const pdfRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${tempDoc.id}/export?mimeType=application/pdf`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!pdfRes.ok) {
    const errText = await pdfRes.text();
    throw new Error(`PDF export failed: ${errText}`);
  }
  const pdfBlob = await pdfRes.arrayBuffer();

  // Step 3: Upload the PDF as a file to Drive
  const pdfBoundary = "pdf_upload_boundary";
  const pdfMetadata = JSON.stringify({
    name: `${title}.pdf`,
    parents: [folderId],
  });

  // Build multipart body with binary PDF
  const encoder = new TextEncoder();
  const metaPart = encoder.encode(
    `--${pdfBoundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${pdfMetadata}\r\n--${pdfBoundary}\r\nContent-Type: application/pdf\r\n\r\n`
  );
  const endPart = encoder.encode(`\r\n--${pdfBoundary}--`);

  const combined = new Uint8Array(metaPart.length + pdfBlob.byteLength + endPart.length);
  combined.set(metaPart, 0);
  combined.set(new Uint8Array(pdfBlob), metaPart.length);
  combined.set(endPart, metaPart.length + pdfBlob.byteLength);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${pdfBoundary}`,
      },
      body: combined,
    }
  );
  const uploadedPdf = await uploadRes.json();
  if (!uploadedPdf.id) {
    throw new Error(`Failed to upload PDF: ${JSON.stringify(uploadedPdf)}`);
  }

  // Step 4: Delete the temporary Google Doc
  await fetch(`https://www.googleapis.com/drive/v3/files/${tempDoc.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return uploadedPdf.id;
}

// Map entity type to folder name
function getFolderName(entityType: string): string {
  switch (entityType) {
    case "checklist": return "Checklists";
    case "gemba_doc": return "SOPs";
    case "file_directory_file": return "Files";
    case "text_display": return "Text";
    default: return "Other";
  }
}

// Map entity type to human-readable name
function getEntityTypeName(entityType: string, toolType?: string): string {
  if (toolType === "follow_up_list") return "Follow-up List";
  switch (entityType) {
    case "checklist": return "Checklist";
    case "gemba_doc": return "SOP Guide";
    case "file_directory_file": return "File";
    case "text_display": return "Text Item";
    default: return "Document";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { data: profile } = await supabaseUser
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orgId = profile.organization_id;

    // Check admin
    const { data: isAdmin } = await supabaseUser.rpc("is_org_admin", {
      _user_id: userId,
      _org_id: orgId,
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { type: rawType, id: rawId, folderId: userFolderId, appUrl } = await req.json();
    if (!rawType || !rawId) {
      return new Response(JSON.stringify({ error: "Missing type or id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for reading tokens and writing refs
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve the entity title and data
    let title = "Untitled";
    let toolType: string | undefined;

    if (rawType === "checklist") {
      const { data: directDoc } = await supabaseUser.from("checklists").select("id, title").eq("id", rawId).maybeSingle();
      if (directDoc) {
        title = directDoc.title;
      } else {
        const { data: menuItemDoc } = await supabaseUser
          .from("menu_item_documents")
          .select("document_id, document_type")
          .eq("menu_item_id", rawId)
          .eq("document_type", "checklist")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (menuItemDoc?.document_id) {
          const { data: cl } = await supabaseUser.from("checklists").select("title").eq("id", menuItemDoc.document_id).single();
          title = cl?.title || "Checklist";
        }
        const { data: mi } = await supabaseUser.from("menu_items").select("tool_type").eq("id", rawId).maybeSingle();
        toolType = mi?.tool_type || undefined;
      }
    } else if (rawType === "gemba_doc") {
      const { data: directDoc } = await supabaseUser.from("gemba_docs").select("id, title").eq("id", rawId).maybeSingle();
      if (directDoc) {
        title = directDoc.title;
      } else {
        const { data: menuItemDoc } = await supabaseUser
          .from("menu_item_documents")
          .select("document_id")
          .eq("menu_item_id", rawId)
          .eq("document_type", "gemba_doc")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (menuItemDoc?.document_id) {
          const { data: gd } = await supabaseUser.from("gemba_docs").select("title").eq("id", menuItemDoc.document_id).single();
          title = gd?.title || "SOP Guide";
        }
      }
    } else if (rawType === "text_display") {
      const { data: menuItem } = await supabaseUser.from("menu_items").select("name, description").eq("id", rawId).single();
      const subType = menuItem?.description;
      if (subType === "lockbox") {
        title = `Lockbox Code: ${menuItem?.name || ""}`;
      } else if (subType === "address") {
        title = `Address: ${menuItem?.name || ""}`;
      } else {
        title = menuItem?.name || "Text Item";
      }
    } else if (rawType === "file_directory_file") {
      const { data: file } = await supabaseUser.from("file_directory_files").select("file_name").eq("id", rawId).single();
      title = file?.file_name || "File";
    }

    // Get integration
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("provider", "google_drive")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "Google Drive not connected. Please connect first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refresh token if expired
    let accessToken = integration.access_token!;
    const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
    if (!expiresAt || expiresAt < new Date(Date.now() + 60000)) {
      if (!integration.refresh_token) {
        return new Response(
          JSON.stringify({ error: "No refresh token. Please reconnect Google Drive." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      let refreshed;
      try {
        refreshed = await refreshAccessToken(integration.refresh_token);
      } catch (refreshErr: any) {
        if (refreshErr.message?.includes("invalid_grant")) {
          await supabase
            .from("organization_integrations")
            .update({ status: "disconnected" })
            .eq("id", integration.id);
          return new Response(
            JSON.stringify({ error: "Google Drive has been disconnected. Please reconnect it in Organization Settings.", code: "DRIVE_TOKEN_EXPIRED" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw refreshErr;
      }
      accessToken = refreshed.access_token;
      await supabase
        .from("organization_integrations")
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq("id", integration.id);
    }

    // Determine target folder
    let targetFolderId: string;
    if (userFolderId) {
      targetFolderId = userFolderId;
    } else {
      const rootFolderId = await getOrCreateRootFolder(
        accessToken,
        supabase,
        integration.id,
        integration.root_folder_id
      );
      const subFolderName = getFolderName(rawType);
      targetFolderId = await getOrCreateSubFolder(accessToken, rootFolderId, subFolderName);
    }

    // Check for existing drive reference
    const { data: existingRef } = await supabase
      .from("drive_file_references")
      .select("*")
      .eq("organization_id", orgId)
      .eq("entity_type", rawType)
      .eq("entity_id", rawId)
      .maybeSingle();

    const existingDriveFileId = existingRef?.drive_file_id || null;

    let driveFileId: string;

    if (rawType === "checklist" || rawType === "gemba_doc") {
      // ─── PDF Export ───
      // Fetch org branding
      const { data: org } = await supabase
        .from("organizations")
        .select("main_logo_url, accent_color")
        .eq("id", orgId)
        .single();

      const logoUrl = org?.main_logo_url || null;
      const accentColor = org?.accent_color || "hsl(22, 90%, 54%)";

      if (rawType === "checklist") {
        // Fetch checklist data — rawId may be a checklist ID or a menu_item ID
        let checklistId = rawId;
        const { data: directCl } = await supabaseUser
          .from("checklists")
          .select("id")
          .eq("id", rawId)
          .maybeSingle();

        if (!directCl) {
          // rawId is a menu_item ID, look up the linked checklist
          const { data: menuItemDoc } = await supabaseUser
            .from("menu_item_documents")
            .select("document_id")
            .eq("menu_item_id", rawId)
            .eq("document_type", "checklist")
            .is("archived_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (menuItemDoc?.document_id) {
            checklistId = menuItemDoc.document_id;
          }
        }

        const { data: checklist } = await supabaseUser
          .from("checklists")
          .select("id, title, description, display_mode")
          .eq("id", checklistId)
          .maybeSingle();

        if (!checklist) throw new Error("Checklist not found");

        const { data: sections } = await supabaseUser
          .from("checklist_sections")
          .select("id, title, display_mode, image_url, sort_order")
          .eq("checklist_id", checklist.id)
          .order("sort_order", { ascending: true });

        const { data: allItems } = await supabaseUser
          .from("checklist_items")
          .select("id, text, parent_item_id, sort_order, item_type, section_id")
          .in("section_id", (sections || []).map((s) => s.id))
          .order("sort_order", { ascending: true });

        const sectionsWithItems = (sections || []).map((s) => ({
          ...s,
          items: (allItems || []).filter((i) => i.section_id === s.id),
        }));

        const html = buildChecklistHtml(checklist, sectionsWithItems, logoUrl, accentColor);
        driveFileId = await createPdfFromHtml(accessToken, targetFolderId, title, html, existingDriveFileId);
      } else {
        // Fetch gemba doc data — rawId may be a gemba_doc ID or a menu_item ID
        let gembaDocId = rawId;
        const { data: directGd } = await supabaseUser
          .from("gemba_docs")
          .select("id")
          .eq("id", rawId)
          .maybeSingle();

        if (!directGd) {
          const { data: menuItemDoc } = await supabaseUser
            .from("menu_item_documents")
            .select("document_id")
            .eq("menu_item_id", rawId)
            .eq("document_type", "gemba_doc")
            .is("archived_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (menuItemDoc?.document_id) {
            gembaDocId = menuItemDoc.document_id;
          }
        }

        const { data: doc } = await supabaseUser
          .from("gemba_docs")
          .select("id, title, description, grid_columns, grid_rows, orientation")
          .eq("id", gembaDocId)
          .maybeSingle();

        if (!doc) throw new Error("SOP Guide not found");

        const { data: pages } = await supabaseUser
          .from("gemba_doc_pages")
          .select("id, page_number")
          .eq("gemba_doc_id", doc.id)
          .order("page_number", { ascending: true });

        const pageIds = (pages || []).map((p) => p.id);
        const { data: allCells } = await supabaseUser
          .from("gemba_doc_cells")
          .select("id, page_id, position, image_url, step_number, step_text")
          .in("page_id", pageIds.length > 0 ? pageIds : ["__none__"]);

        const pagesWithCells = (pages || []).map((p) => ({
          page_number: p.page_number,
          cells: (allCells || []).filter((c) => c.page_id === p.id),
        }));

        const html = buildGembaDocHtml(doc, pagesWithCells, logoUrl, accentColor);
        driveFileId = await createPdfFromHtml(accessToken, targetFolderId, title, html, existingDriveFileId);
      }
    } else {
      // ─── Google Doc (text_display, file_directory_file) ───
      const linkUrl = appUrl || "https://app.example.com";
      const entityTypeName = getEntityTypeName(rawType, toolType);
      driveFileId = await createOrUpdateLinkDoc(
        accessToken,
        targetFolderId,
        title,
        linkUrl,
        entityTypeName,
        existingDriveFileId
      );
    }

    // Construct the Drive web link
    const driveWebLink = `https://drive.google.com/file/d/${driveFileId}/view`;

    // Upsert drive_file_references
    if (existingRef) {
      await supabase
        .from("drive_file_references")
        .update({
          drive_file_id: driveFileId,
          drive_folder_id: targetFolderId,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", existingRef.id);
    } else {
      await supabase.from("drive_file_references").insert({
        organization_id: orgId,
        entity_type: rawType,
        entity_id: rawId,
        drive_file_id: driveFileId,
        drive_folder_id: targetFolderId,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        drive_file_id: driveFileId,
        drive_web_link: driveWebLink,
        message: `Successfully exported to Google Drive`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("google-drive-export error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
