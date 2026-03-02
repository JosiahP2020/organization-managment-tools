import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDriveExport() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());

  // Check if Google Drive is connected
  const { data: isConnected } = useQuery({
    queryKey: ["drive-connected", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return false;
      const { data } = await supabase
        .from("organization_integrations")
        .select("status")
        .eq("organization_id", organization.id)
        .eq("provider", "google_drive")
        .eq("status", "connected")
        .maybeSingle();
      return !!data;
    },
    enabled: !!organization?.id,
  });

  // Fetch all drive file references for this org
  const { data: driveRefs } = useQuery({
    queryKey: ["drive-file-refs", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data } = await supabase
        .from("drive_file_references")
        .select("entity_id, entity_type, last_synced_at, drive_file_id")
        .eq("organization_id", organization.id);
      return data || [];
    },
    enabled: !!organization?.id,
  });

  const getRef = (entityId: string) =>
    driveRefs?.find((r) => r.entity_id === entityId) || null;

  // Open the Drive document in a new tab
  const openInDrive = (entityId: string) => {
    const ref = getRef(entityId);
    if (ref?.drive_file_id) {
      window.open(`https://docs.google.com/document/d/${ref.drive_file_id}/edit`, "_blank");
    }
  };

  const exportToDrive = async (type: string, id: string, folderId?: string) => {
    setExportingIds((prev) => new Set(prev).add(id));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Pass the current page URL as the app link
      const appUrl = window.location.href;

      const { data, error } = await supabase.functions.invoke("google-drive-export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { type, id, folderId, appUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Exported to Google Drive");
      queryClient.invalidateQueries({ queryKey: ["drive-file-refs", organization?.id] });
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setExportingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return {
    isConnected: !!isConnected,
    driveRefs: driveRefs || [],
    getRef,
    exportToDrive,
    isExporting: (id: string) => exportingIds.has(id),
    openInDrive,
  };
}
