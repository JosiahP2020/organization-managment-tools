import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Link, Unlink, CheckCircle2, Loader2, Mail, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface DriveIntegration {
  id: string;
  status: string;
  connected_email: string | null;
  connected_at: string | null;
}

export function GoogleDriveConnection() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [integration, setIntegration] = useState<DriveIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Handle callback params
  useEffect(() => {
    if (searchParams.get("drive_connected") === "true") {
      toast({ title: "Google Drive Connected", description: "Your Google Drive account has been linked successfully." });
      searchParams.delete("drive_connected");
      setSearchParams(searchParams, { replace: true });
      fetchIntegration();
    }
    const driveError = searchParams.get("drive_error");
    if (driveError) {
      toast({ title: "Connection Failed", description: `Google Drive connection failed: ${driveError}`, variant: "destructive" });
      searchParams.delete("drive_error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const fetchIntegration = async () => {
    if (!organization?.id) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("organization_integrations")
      .select("id, status, connected_email, connected_at")
      .eq("organization_id", organization.id)
      .eq("provider", "google_drive")
      .maybeSingle();
    setIntegration(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIntegration();
  }, [organization?.id]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Use the top-level window origin for redirect (preview iframe vs top frame)
      const topOrigin = window.top ? window.top.location.origin : window.location.origin;
      const { data, error } = await supabase.functions.invoke("google-drive-auth", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { origin: topOrigin },
      });

      if (error) throw error;
      if (data?.url) {
        // Navigate the top-level window to avoid iframe/new-tab issues
        if (window.top && window.top !== window) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start connection", variant: "destructive" });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration) return;
    setIsDisconnecting(true);
    const { error } = await supabase
      .from("organization_integrations")
      .update({ status: "disconnected", access_token: null, refresh_token: null, connected_email: null, connected_at: null })
      .eq("id", integration.id);

    if (error) {
      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
    } else {
      toast({ title: "Disconnected", description: "Google Drive has been disconnected." });
      setIntegration({ ...integration, status: "disconnected", connected_email: null, connected_at: null });
    }
    setIsDisconnecting(false);
  };

  const isConnected = integration?.status === "connected";

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Google Drive</h2>
          <p className="text-sm text-muted-foreground">
            Connect Google Drive for file storage and syncing
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking connection status…</span>
        </div>
      ) : isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-primary">Connected</span>
          </div>

          {integration?.connected_email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{integration.connected_email}</span>
            </div>
          )}

          {integration?.connected_at && (
            <p className="text-xs text-muted-foreground">
              Connected on {new Date(integration.connected_at).toLocaleDateString()}
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="gap-2 text-destructive hover:text-destructive"
          >
            {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Not connected</span>
          </div>

          <Button onClick={handleConnect} disabled={isConnecting} className="gap-2">
            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
            Connect Google Drive
          </Button>
        </div>
      )}
    </div>
  );
}
