import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Default app origin fallback
    const defaultOrigin = Deno.env.get("APP_ORIGIN") || "https://id-preview--b4ff9489-f27c-41e6-a539-69485bbbddba.lovable.app";

    if (error) {
      return Response.redirect(`${defaultOrigin}/admin/organization?drive_error=${encodeURIComponent(error)}`, 302);
    }

    if (!code || !stateParam) {
      return Response.redirect(`${defaultOrigin}/admin/organization?drive_error=missing_params`, 302);
    }

    let orgId: string;
    let appOrigin = defaultOrigin;
    try {
      const state = JSON.parse(atob(stateParam));
      orgId = state.org_id;
      if (state.origin) appOrigin = state.origin;
    } catch {
      return Response.redirect(`${defaultOrigin}/admin/organization?drive_error=invalid_state`, 302);
    }

    // Exchange code for tokens
    const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-drive-callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return Response.redirect(`${appOrigin}/admin/organization?drive_error=token_exchange_failed`, 302);
    }

    // Get user email from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    // Use service role to store tokens
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Upsert the integration record
    const { data: existing } = await supabase
      .from("organization_integrations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("provider", "google_drive")
      .single();

    if (existing) {
      await supabase
        .from("organization_integrations")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          token_expires_at: expiresAt,
          connected_email: userInfo.email || null,
          connected_at: new Date().toISOString(),
          status: "connected",
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("organization_integrations").insert({
        organization_id: orgId,
        provider: "google_drive",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        connected_email: userInfo.email || null,
        connected_at: new Date().toISOString(),
        status: "connected",
      });
    }

    return Response.redirect(`${appOrigin}/admin/organization?drive_connected=true`, 302);
  } catch (err) {
    console.error("google-drive-callback error:", err);
    const appOrigin = Deno.env.get("APP_ORIGIN") || "https://id-preview--b4ff9489-f27c-41e6-a539-69485bbbddba.lovable.app";
    return Response.redirect(`${appOrigin}/admin/organization?drive_error=server_error`, 302);
  }
});
