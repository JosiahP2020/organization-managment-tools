import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDriveExport() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const verifiedRef = useRef(false);

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
        .select("entity_id, entity_type, last_synced_at, drive_file_id, drive_folder_id")
        .eq("organization_id", organization.id);
      return data || [];
    },
    enabled: !!organization?.id,
  });

  // Background verify: check if Drive files still exist, clean up stale refs
  useEffect(() => {
    if (!isConnected || !driveRefs || driveRefs.length === 0 || verifiedRef.current) return;
    verifiedRef.current = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase.functions.invoke("google-drive-verify", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: {},
        });

        if (!error && data?.removedEntityIds?.length > 0) {
          queryClient.invalidateQueries({ queryKey: ["drive-file-refs", organization?.id] });
          console.log(`Cleaned up ${data.removedEntityIds.length} stale Drive references`);
        }
      } catch (err) {
        console.warn("Drive verify failed:", err);
      }
    })();
  }, [isConnected, driveRefs, organization?.id, queryClient]);

  const getRef = (entityId: string) =>
    driveRefs?.find((r) => r.entity_id === entityId) || null;

  // Open the Drive document in a new tab
  const openInDrive = (entityId: string) => {
    const ref = getRef(entityId);
    if (ref?.drive_file_id) {
      window.open(`https://drive.google.com/file/d/${ref.drive_file_id}/view`, "_blank");
    }
  };

  const exportToDrive = async (type: string, id: string, folderId?: string) => {
    setExportingIds((prev) => new Set(prev).add(id));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const appUrl = window.location.href;

      const { data, error } = await supabase.functions.invoke("google-drive-export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { type, id, folderId, appUrl },
      });

      if (error) throw error;
      if (data?.code === "DRIVE_TOKEN_EXPIRED") {
        toast.error("Google Drive has been disconnected. Please reconnect it in Organization Settings.");
        queryClient.invalidateQueries({ queryKey: ["drive-connected", organization?.id] });
        return;
      }
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

  // Auto-sync: re-export if entity already has a Drive reference
  const syncToDriveIfNeeded = useCallback(async (entityType: string, entityId: string, options?: { silent?: boolean }) => {
    if (!driveRefs || !isConnected) return;
    const ref = driveRefs.find((r) => r.entity_id === entityId && r.entity_type === entityType);
    if (!ref) return;

    setSyncingIds((prev) => new Set(prev).add(entityId));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (!options?.silent) {
        toast.info("Syncing to Drive...", { duration: 2000 });
      }

      const { data, error } = await supabase.functions.invoke("google-drive-export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { type: entityType, id: entityId, folderId: ref.drive_folder_id, appUrl: window.location.href },
      });

      if (!error && !data?.error) {
        queryClient.invalidateQueries({ queryKey: ["drive-file-refs", organization?.id] });
        if (!options?.silent) {
          toast.success("Synced to Drive");
        }
      }
    } catch (err) {
      console.warn("Auto-sync to Drive failed:", err);
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(entityId);
        return next;
      });
    }
  }, [driveRefs, isConnected, organization?.id, queryClient]);

  // Batch sync all items with drive refs for a given category
  const syncAllForCategory = useCallback(async (items: Array<{ type: string; id: string }>) => {
    for (const item of items) {
      await syncToDriveIfNeeded(item.type, item.id, { silent: true });
      // Small delay between calls to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }, [syncToDriveIfNeeded]);

  return {
    isConnected: !!isConnected,
    driveRefs: driveRefs || [],
    getRef,
    exportToDrive,
    isExporting: (id: string) => exportingIds.has(id),
    isSyncing: (id: string) => syncingIds.has(id),
    openInDrive,
    syncToDriveIfNeeded,
    syncAllForCategory,
  };
}
