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

// Create or update a Google Doc that serves as a link back to the app
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
    // Verify the file still exists on Drive
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${existingFileId}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const fileStillExists = checkRes.ok && !(await checkRes.json()).trashed;

    if (fileStillExists) {
      // Update existing Google Doc
      const boundary = "multipart_boundary";
      const metadata = JSON.stringify({ name: title });
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
        `--${boundary}--`;

      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,webViewLink`,
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
    // File was deleted from Drive, fall through to create new
    console.log(`Existing file ${existingFileId} was deleted from Drive, creating fresh`);
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
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
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

    // Resolve the entity title for the link document
    let title = "Untitled";
    let toolType: string | undefined;

    if (rawType === "checklist" || rawType === "gemba_doc") {
      // Check if rawId is a direct document or a menu_item
      if (rawType === "checklist") {
        const { data: directDoc } = await supabaseUser.from("checklists").select("id, title").eq("id", rawId).maybeSingle();
        if (directDoc) {
          title = directDoc.title;
        } else {
          // Look up via menu_item_documents
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
          // Also get tool_type from menu_item
          const { data: mi } = await supabaseUser.from("menu_items").select("tool_type").eq("id", rawId).maybeSingle();
          toolType = mi?.tool_type || undefined;
        }
      } else {
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
      }
    } else if (rawType === "text_display") {
      const { data: menuItem } = await supabaseUser.from("menu_items").select("name").eq("id", rawId).single();
      title = menuItem?.name || "Text Item";
    } else if (rawType === "file_directory_file") {
      const { data: file } = await supabaseUser.from("file_directory_files").select("file_name").eq("id", rawId).single();
      title = file?.file_name || "File";
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

    // Build the app URL — use the provided URL or construct a fallback
    const linkUrl = appUrl || "https://app.example.com";
    const entityTypeName = getEntityTypeName(rawType, toolType);

    // Create or update the link document on Drive
    const driveFileId = await createOrUpdateLinkDoc(
      accessToken,
      targetFolderId,
      title,
      linkUrl,
      entityTypeName,
      existingDriveFileId
    );

    // Construct the Drive web link for this document
    const driveWebLink = `https://docs.google.com/document/d/${driveFileId}/edit`;

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
