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

// Create a Google Doc from HTML, export as PDF, upload PDF, delete temp doc
async function createPdfFromHtml(
  accessToken: string,
  folderId: string,
  title: string,
  htmlContent: string,
  existingFileId: string | null
): Promise<string> {
  // Step 1: Create a temporary Google Doc with HTML content
  const boundary = "multipart_boundary";
  const metadata = JSON.stringify({
    name: `_temp_${title}`,
    mimeType: "application/vnd.google-apps.document",
  });
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${htmlContent}\r\n` +
    `--${boundary}--`;

  const createRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  const tempDoc = await createRes.json();
  console.log("Temp doc creation response:", JSON.stringify(tempDoc));
  if (!tempDoc.id) {
    throw new Error(`Failed to create temporary document: ${JSON.stringify(tempDoc)}`);
  }

  try {
    // Step 2: Export the Google Doc as PDF
    const pdfRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${tempDoc.id}/export?mimeType=application/pdf`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      throw new Error(`PDF export failed (${pdfRes.status}): ${errText}`);
    }
    const pdfBlob = await pdfRes.blob();
    console.log(`PDF blob size: ${pdfBlob.size} bytes`);

    let driveFileId: string;

    if (existingFileId) {
      // Update existing PDF file content
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/pdf",
          },
          body: pdfBlob,
        }
      );
      const updateData = await updateRes.json();
      console.log("Update existing PDF response:", JSON.stringify(updateData));
      if (!updateData.id) {
        throw new Error(`Failed to update PDF: ${JSON.stringify(updateData)}`);
      }
      driveFileId = updateData.id;

      // Also update the name
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${existingFileId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: `${title}.pdf` }),
        }
      );
    } else {
      // Upload new PDF file
      const pdfBoundary = "pdf_boundary";
      const pdfMetadata = JSON.stringify({
        name: `${title}.pdf`,
        parents: [folderId],
      });

      const metaPart = `--${pdfBoundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${pdfMetadata}\r\n`;
      const filePart = `--${pdfBoundary}\r\nContent-Type: application/pdf\r\n\r\n`;
      const endPart = `\r\n--${pdfBoundary}--`;

      const metaBytes = new TextEncoder().encode(metaPart + filePart);
      const fileBytes = new Uint8Array(await pdfBlob.arrayBuffer());
      const endBytes = new TextEncoder().encode(endPart);

      const combined = new Uint8Array(metaBytes.length + fileBytes.length + endBytes.length);
      combined.set(metaBytes, 0);
      combined.set(fileBytes, metaBytes.length);
      combined.set(endBytes, metaBytes.length + fileBytes.length);

      const uploadRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${pdfBoundary}`,
          },
          body: combined,
        }
      );
      const uploadData = await uploadRes.json();
      console.log("Upload new PDF response:", JSON.stringify(uploadData));
      if (!uploadData.id) {
        throw new Error(`Failed to upload PDF: ${JSON.stringify(uploadData)}`);
      }
      driveFileId = uploadData.id;
    }

    return driveFileId;
  } finally {
    // Step 3: Always delete the temporary Google Doc
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${tempDoc.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }
}

// Create or update a Google Doc (for text_display items)
async function createOrUpdateGoogleDoc(
  accessToken: string,
  folderId: string,
  title: string,
  htmlContent: string,
  existingFileId: string | null
): Promise<string> {
  if (existingFileId) {
    const boundary = "multipart_boundary";
    const metadata = JSON.stringify({ name: title });
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${htmlContent}\r\n` +
      `--${boundary}--`;

    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`,
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

  const boundary = "multipart_boundary";
  const metadata = JSON.stringify({
    name: title,
    mimeType: "application/vnd.google-apps.document",
    parents: [folderId],
  });
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${htmlContent}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
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
  return data.id;
}

// Upload a file to Drive
async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  fileUrl: string,
  existingFileId: string | null
): Promise<string> {
  const fileRes = await fetch(fileUrl);
  const fileBlob = await fileRes.blob();
  const mimeType = fileRes.headers.get("content-type") || "application/octet-stream";

  if (existingFileId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": mimeType,
        },
        body: fileBlob,
      }
    );
    const data = await res.json();
    return data.id;
  }

  const boundary = "file_boundary";
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
  const filePart = `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const endPart = `\r\n--${boundary}--`;

  const metaBytes = new TextEncoder().encode(metaPart + filePart);
  const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());
  const endBytes = new TextEncoder().encode(endPart);

  const combined = new Uint8Array(metaBytes.length + fileBytes.length + endBytes.length);
  combined.set(metaBytes, 0);
  combined.set(fileBytes, metaBytes.length);
  combined.set(endBytes, metaBytes.length + fileBytes.length);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    }
  );
  const data = await res.json();
  return data.id;
}

// Build HTML content for a checklist matching ChecklistPrintView format
function buildChecklistHtml(checklist: any, sections: any[], items: any[], logoUrl: string | null, accentColor: string): string {
  const accent = accentColor || "22, 90%, 54%";
  let html = `<!DOCTYPE html><html><head><style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; padding: 0.5in; margin: 0; }
    .header { display: flex; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid black; }
    .header-logo { height: 64px; width: auto; flex-shrink: 0; }
    .header-title { flex: 1; text-align: center; font-size: 24px; font-weight: bold; }
    .header-spacer { width: 64px; flex-shrink: 0; }
    .section { margin-bottom: 24px; }
    .section-title { font-weight: 600; font-size: 16px; padding: 8px 12px; margin-bottom: 8px; background: #f5f5f5; border-left: 4px solid hsl(${accent}); }
    .item { display: flex; align-items: flex-start; gap: 12px; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
    .item-indent { margin-left: 24px; }
    .checkbox { width: 18px; height: 18px; min-width: 18px; border: 2px solid black; border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
    .number { min-width: 24px; font-weight: 500; font-size: 14px; flex-shrink: 0; margin-top: 2px; }
    .item-text { font-size: 14px; flex: 1; }
    .section-image { max-height: 192px; border: 1px solid #e5e5e5; margin-bottom: 12px; margin-left: 8px; }
  </style></head><body>`;

  // Header with logo and title
  html += `<div class="header">`;
  if (logoUrl) {
    html += `<img src="${logoUrl}" class="header-logo" />`;
  } else {
    html += `<div class="header-spacer"></div>`;
  }
  html += `<div class="header-title">${checklist.title}</div>`;
  html += `<div class="header-spacer"></div>`;
  html += `</div>`;

  for (const section of sections.sort((a: any, b: any) => a.sort_order - b.sort_order)) {
    const isNumbered = section.display_mode === 'numbered';
    html += `<div class="section">`;
    html += `<div class="section-title">${section.title}</div>`;

    if (section.image_url) {
      html += `<img src="${section.image_url}" class="section-image" />`;
    }

    const topItems = items
      .filter((i: any) => i.section_id === section.id && !i.parent_item_id)
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    for (let idx = 0; idx < topItems.length; idx++) {
      const item = topItems[idx];
      html += `<div class="item">`;
      if (isNumbered) {
        html += `<span class="number">${idx + 1}.</span>`;
      } else {
        html += `<div class="checkbox"></div>`;
      }
      html += `<span class="item-text">${item.text}</span>`;
      html += `</div>`;

      const children = items
        .filter((i: any) => i.parent_item_id === item.id)
        .sort((a: any, b: any) => a.sort_order - b.sort_order);
      for (let ci = 0; ci < children.length; ci++) {
        html += `<div class="item item-indent">`;
        if (isNumbered) {
          html += `<span class="number">${String.fromCharCode(65 + ci)}.</span>`;
        } else {
          html += `<div class="checkbox"></div>`;
        }
        html += `<span class="item-text">${children[ci].text}</span>`;
        html += `</div>`;
      }
    }
    html += `</div>`;
  }
  html += `</body></html>`;
  return html;
}

// Build HTML content for a gemba doc (SOP) matching GembaDocPrintView format
function buildGembaDocHtml(doc: any, pages: any[], cells: any[], logoUrl: string | null, accentColor: string): string {
  const accent = accentColor || "22, 90%, 54%";
  let html = `<!DOCTYPE html><html><head><style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; margin: 0; padding: 0.4in; }
    .page { margin-bottom: 24px; }
    .header { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; padding-bottom: 8px; min-height: 64px; }
    .logo { position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 64px; width: auto; }
    .page-number { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 20px; font-weight: 700; color: hsl(${accent}); background: hsla(${accent}, 0.15); border-radius: 8px; padding: 4px 8px; min-width: 32px; text-align: center; }
    .title { font-size: 32px; font-weight: 700; margin: 0; text-align: center; }
    .description { font-size: 16px; color: #666; margin: 6px 0 0; text-align: center; }
    .grid { display: grid; gap: 6px; }
    .cell { position: relative; overflow: hidden; border-radius: 8px; }
    .cell-empty { background: transparent; }
    .step-badge { position: absolute; top: 8px; left: 8px; background: hsl(${accent}); color: white; min-width: 32px; height: 32px; padding: 0 8px; font-weight: 700; font-size: 14px; border-radius: 6px; display: flex; align-items: center; justify-content: center; z-index: 1; }
    .cell-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; }
    .step-text { font-size: 13px; font-weight: 600; line-height: 1.3; color: #333; margin: 0; padding: 4px 6px; }
  </style></head><body>`;

  const sortedPages = pages.sort((a: any, b: any) => a.page_number - b.page_number);
  for (let pi = 0; pi < sortedPages.length; pi++) {
    const page = sortedPages[pi];
    html += `<div class="page">`;
    html += `<div class="header">`;
    if (logoUrl) {
      html += `<img src="${logoUrl}" class="logo" />`;
    }
    if (pi === 0) {
      html += `<div><h1 class="title">${doc.title}</h1>`;
      if (doc.description) html += `<p class="description">${doc.description}</p>`;
      html += `</div>`;
    }
    html += `<span class="page-number">${page.page_number}</span>`;
    html += `</div>`;

    const gridCols = doc.grid_columns || 2;
    const gridRows = doc.grid_rows || 2;
    html += `<div class="grid" style="grid-template-columns: repeat(${gridCols}, 1fr); grid-template-rows: repeat(${gridRows}, 200px);">`;
    
    const pageCells = cells.filter((c: any) => c.page_id === page.id);
    for (let i = 0; i < gridRows * gridCols; i++) {
      const cell = pageCells.find((c: any) => c.position === i);
      const stepNumber = i + 1;
      if (!cell?.image_url) {
        html += `<div class="cell cell-empty"></div>`;
      } else {
        html += `<div class="cell">`;
        html += `<div style="position:relative;">`;
        html += `<div class="step-badge">${stepNumber}</div>`;
        html += `<img src="${cell.image_url}" class="cell-image" />`;
        html += `</div>`;
        html += `<p class="step-text">${cell.step_text || ""}</p>`;
        html += `</div>`;
      }
    }
    html += `</div></div>`;
  }
  html += `</body></html>`;
  return html;
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
    const { type: rawType, id: rawId, folderId: userFolderId } = await req.json();
    if (!rawType || !rawId) {
      return new Response(JSON.stringify({ error: "Missing type or id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If the type is a tool type (checklist/follow_up_list/sop_guide), resolve the actual document
    // The rawId is a menu_item_id — we need to find the linked document
    let type = rawType;
    let id = rawId;

    if (rawType === "checklist" || rawType === "gemba_doc") {
      // Check if this ID is actually a menu_item rather than a document
      const { data: directDoc } = rawType === "checklist"
        ? await supabaseUser.from("checklists").select("id").eq("id", rawId).maybeSingle()
        : await supabaseUser.from("gemba_docs").select("id").eq("id", rawId).maybeSingle();

      if (!directDoc) {
        // It's likely a menu_item_id — look up the linked document
        const docType = rawType === "checklist" ? "checklist" : "gemba_doc";
        const { data: menuItemDoc } = await supabaseUser
          .from("menu_item_documents")
          .select("document_id, document_type")
          .eq("menu_item_id", rawId)
          .eq("document_type", docType)
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (menuItemDoc?.document_id) {
          id = menuItemDoc.document_id;
          console.log(`Resolved menu_item ${rawId} -> ${docType} document ${id}`);
        } else {
          console.log(`No linked ${docType} document found for menu_item ${rawId}`);
        }
      }
    }

    // Service role client for reading tokens and writing refs
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
      const refreshed = await refreshAccessToken(integration.refresh_token);
      accessToken = refreshed.access_token;
      await supabase
        .from("organization_integrations")
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq("id", integration.id);
    }

    // Determine target folder: user-chosen folder or fallback to _app_storage/subfolder
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
      const subFolderName = getFolderName(type);
      targetFolderId = await getOrCreateSubFolder(accessToken, rootFolderId, subFolderName);
    }

    // Check for existing drive reference (check both rawId and resolved id)
    const { data: existingRefByRaw } = await supabase
      .from("drive_file_references")
      .select("*")
      .eq("organization_id", orgId)
      .eq("entity_type", type)
      .eq("entity_id", rawId)
      .maybeSingle();

    const { data: existingRefByResolved } = id !== rawId ? await supabase
      .from("drive_file_references")
      .select("*")
      .eq("organization_id", orgId)
      .eq("entity_type", type)
      .eq("entity_id", id)
      .maybeSingle() : { data: null };

    const existingRef = existingRefByRaw || existingRefByResolved;

    const existingDriveFileId = existingRef?.drive_file_id || null;

    let driveFileId: string;

    // Fetch organization logo and accent color for PDF formatting
    const { data: orgData } = await supabase
      .from("organizations")
      .select("main_logo_url, accent_color")
      .eq("id", orgId)
      .single();
    const logoUrl = orgData?.main_logo_url || null;
    const accentColor = orgData?.accent_color || "22, 90%, 54%";

    // Export based on type
    if (type === "checklist") {
      const { data: checklist } = await supabaseUser
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (!checklist) {
        return new Response(JSON.stringify({ error: "Checklist not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: sections } = await supabaseUser
        .from("checklist_sections")
        .select("*")
        .eq("checklist_id", id);

      const sectionIds = (sections || []).map((s: any) => s.id);
      let items: any[] = [];
      if (sectionIds.length > 0) {
        const { data: itemsData } = await supabaseUser
          .from("checklist_items")
          .select("*")
          .in("section_id", sectionIds);
        items = itemsData || [];
      }

      const html = buildChecklistHtml(checklist, sections || [], items, logoUrl, accentColor);
      console.log(`Generated checklist HTML (${html.length} chars) for "${checklist.title}"`);
      // Export as PDF
      driveFileId = await createPdfFromHtml(
        accessToken,
        targetFolderId,
        checklist.title,
        html,
        existingDriveFileId
      );
    } else if (type === "gemba_doc") {
      const { data: doc } = await supabaseUser
        .from("gemba_docs")
        .select("*")
        .eq("id", id)
        .single();

      if (!doc) {
        return new Response(JSON.stringify({ error: "SOP document not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: pages } = await supabaseUser
        .from("gemba_doc_pages")
        .select("*")
        .eq("gemba_doc_id", id);

      const pageIds = (pages || []).map((p: any) => p.id);
      let cells: any[] = [];
      if (pageIds.length > 0) {
        const { data: cellsData } = await supabaseUser
          .from("gemba_doc_cells")
          .select("*")
          .in("page_id", pageIds);
        cells = cellsData || [];
      }

      const html = buildGembaDocHtml(doc, pages || [], cells, logoUrl, accentColor);
      console.log(`Generated gemba doc HTML (${html.length} chars) for "${doc.title}"`);
      // Export as PDF
      driveFileId = await createPdfFromHtml(
        accessToken,
        targetFolderId,
        doc.title,
        html,
        existingDriveFileId
      );
    } else if (type === "file_directory_file") {
      const { data: file } = await supabaseUser
        .from("file_directory_files")
        .select("*")
        .eq("id", id)
        .single();

      if (!file) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      driveFileId = await uploadFileToDrive(
        accessToken,
        targetFolderId,
        file.file_name,
        file.file_url,
        existingDriveFileId
      );
    } else if (type === "text_display") {
      const { data: menuItem } = await supabaseUser
        .from("menu_items")
        .select("*")
        .eq("id", id)
        .single();

      if (!menuItem) {
        return new Response(JSON.stringify({ error: "Text display item not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const html = `<h1>${menuItem.name}</h1><p>${menuItem.description || ""}</p>`;
      driveFileId = await createOrUpdateGoogleDoc(
        accessToken,
        targetFolderId,
        menuItem.name,
        html,
        existingDriveFileId
      );
    } else {
      return new Response(JSON.stringify({ error: `Unsupported type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert drive_file_references — always store rawId (menu item ID) so UI can look it up
    if (existingRef) {
      await supabase
        .from("drive_file_references")
        .update({
          drive_file_id: driveFileId,
          drive_folder_id: targetFolderId,
          entity_id: rawId, // Ensure it's stored by menu item ID
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", existingRef.id);
    } else {
      await supabase.from("drive_file_references").insert({
        organization_id: orgId,
        entity_type: type,
        entity_id: rawId, // Store by menu item ID
        drive_file_id: driveFileId,
        drive_folder_id: targetFolderId,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        drive_file_id: driveFileId,
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
