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
  // Check if existing folder ID is still valid
  if (existingRootFolderId) {
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${existingRootFolderId}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (checkRes.ok) {
      const file = await checkRes.json();
      if (!file.trashed) return existingRootFolderId;
    } else {
      await checkRes.text(); // consume body
    }
  }

  // Search for existing _app_storage folder
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

  // Create new folder
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

// Create or update a Google Doc
async function createOrUpdateGoogleDoc(
  accessToken: string,
  folderId: string,
  title: string,
  htmlContent: string,
  existingFileId: string | null
): Promise<string> {
  if (existingFileId) {
    // Update existing - upload new content
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

  // Create new Google Doc
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
  // Fetch the file content
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

  // Create new file
  const boundary = "file_boundary";
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  // For simple files, use resumable or multipart
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

// Build HTML content for a checklist
function buildChecklistHtml(checklist: any, sections: any[], items: any[]): string {
  let html = `<h1>${checklist.title}</h1>`;
  if (checklist.description) html += `<p>${checklist.description}</p>`;

  for (const section of sections.sort((a: any, b: any) => a.sort_order - b.sort_order)) {
    html += `<h2>${section.title}</h2>`;
    const sectionItems = items
      .filter((i: any) => i.section_id === section.id && !i.parent_item_id)
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    html += "<ul>";
    for (const item of sectionItems) {
      html += `<li>${item.text}${item.notes ? ` — <em>${item.notes}</em>` : ""}</li>`;
      // Sub-items
      const subItems = items
        .filter((i: any) => i.parent_item_id === item.id)
        .sort((a: any, b: any) => a.sort_order - b.sort_order);
      if (subItems.length > 0) {
        html += "<ul>";
        for (const sub of subItems) {
          html += `<li>${sub.text}${sub.notes ? ` — <em>${sub.notes}</em>` : ""}</li>`;
        }
        html += "</ul>";
      }
    }
    html += "</ul>";
  }
  return html;
}

// Build HTML content for a gemba doc (SOP)
function buildGembaDocHtml(doc: any, pages: any[], cells: any[]): string {
  let html = `<h1>${doc.title}</h1>`;
  if (doc.description) html += `<p>${doc.description}</p>`;

  for (const page of pages.sort((a: any, b: any) => a.page_number - b.page_number)) {
    if (pages.length > 1) html += `<h2>Page ${page.page_number}</h2>`;
    const pageCells = cells
      .filter((c: any) => c.page_id === page.id)
      .sort((a: any, b: any) => a.position - b.position);

    html += "<table border='1' cellpadding='8' cellspacing='0'>";
    for (const cell of pageCells) {
      html += "<tr>";
      html += `<td><strong>${cell.step_number || ""}</strong></td>`;
      html += `<td>${cell.step_text || ""}</td>`;
      if (cell.image_url) {
        html += `<td><img src="${cell.image_url}" width="200" /></td>`;
      }
      html += "</tr>";
    }
    html += "</table>";
  }
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
    const { type, id } = await req.json();
    if (!type || !id) {
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

    // Get or create root folder
    const rootFolderId = await getOrCreateRootFolder(
      accessToken,
      supabase,
      integration.id,
      integration.root_folder_id
    );

    // Get or create sub-folder by type
    const subFolderName = getFolderName(type);
    const subFolderId = await getOrCreateSubFolder(accessToken, rootFolderId, subFolderName);

    // Check for existing drive reference
    const { data: existingRef } = await supabase
      .from("drive_file_references")
      .select("*")
      .eq("organization_id", orgId)
      .eq("entity_type", type)
      .eq("entity_id", id)
      .single();

    const existingDriveFileId = existingRef?.drive_file_id || null;

    let driveFileId: string;

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

      const html = buildChecklistHtml(checklist, sections || [], items);
      driveFileId = await createOrUpdateGoogleDoc(
        accessToken,
        subFolderId,
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

      const html = buildGembaDocHtml(doc, pages || [], cells);
      driveFileId = await createOrUpdateGoogleDoc(
        accessToken,
        subFolderId,
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
        subFolderId,
        file.file_name,
        file.file_url,
        existingDriveFileId
      );
    } else if (type === "text_display") {
      // Text display items use menu_items description
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
        subFolderId,
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

    // Upsert drive_file_references
    if (existingRef) {
      await supabase
        .from("drive_file_references")
        .update({
          drive_file_id: driveFileId,
          drive_folder_id: subFolderId,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", existingRef.id);
    } else {
      await supabase.from("drive_file_references").insert({
        organization_id: orgId,
        entity_type: type,
        entity_id: id,
        drive_file_id: driveFileId,
        drive_folder_id: subFolderId,
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
