import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get integration token
    const { data: integration } = await supabase
      .from("organization_integrations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("provider", "google_drive")
      .eq("status", "connected")
      .single();

    if (!integration) {
      return new Response(JSON.stringify({ invalidIds: [], removedEntityIds: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh token if needed
    let accessToken = integration.access_token!;
    const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
    if (!expiresAt || expiresAt < new Date(Date.now() + 60000)) {
      if (!integration.refresh_token) {
        return new Response(JSON.stringify({ invalidIds: [], removedEntityIds: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const refreshed = await refreshAccessToken(integration.refresh_token);
        accessToken = refreshed.access_token;
        await supabase
          .from("organization_integrations")
          .update({
            access_token: accessToken,
            token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          })
          .eq("id", integration.id);
      } catch {
        return new Response(JSON.stringify({ invalidIds: [], removedEntityIds: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get all drive refs for this org
    const { data: refs } = await supabase
      .from("drive_file_references")
      .select("id, drive_file_id, entity_id")
      .eq("organization_id", orgId);

    if (!refs || refs.length === 0) {
      return new Response(JSON.stringify({ invalidIds: [], removedEntityIds: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check each file against Drive API
    const invalidRefIds: string[] = [];
    const removedEntityIds: string[] = [];

    await Promise.all(
      refs.map(async (ref) => {
        try {
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${ref.drive_file_id}?fields=id,trashed`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!res.ok) {
            invalidRefIds.push(ref.id);
            removedEntityIds.push(ref.entity_id);
          } else {
            const file = await res.json();
            if (file.trashed) {
              invalidRefIds.push(ref.id);
              removedEntityIds.push(ref.entity_id);
            }
          }
        } catch {
          // Network error - skip, don't delete
        }
      })
    );

    // Delete invalid refs
    if (invalidRefIds.length > 0) {
      await supabase
        .from("drive_file_references")
        .delete()
        .in("id", invalidRefIds);
    }

    return new Response(
      JSON.stringify({ invalidIds: invalidRefIds, removedEntityIds }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("google-drive-verify error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
