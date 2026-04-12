import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PipeDrawerDiagram, { PipeDrawerEntry } from "@/components/pipe-drawer/PipeDrawerDiagram";

const PipeDrawerEditor = () => {
  const { projectId, measurementId, orgSlug } = useParams<{
    projectId: string;
    measurementId: string;
    orgSlug: string;
  }>();
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  // Fetch parent measurement record for the title
  const { data: measurement, isLoading: measurementLoading } = useQuery({
    queryKey: ["pipe-drawer-measurement", measurementId],
    queryFn: async () => {
      if (!measurementId) return null;
      const { data, error } = await supabase
        .from("pipe_drawer_measurements")
        .select("*")
        .eq("id", measurementId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!measurementId,
  });

  // Fetch entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["pipe-drawer-entries", measurementId],
    queryFn: async () => {
      if (!measurementId) return [];
      const { data, error } = await supabase
        .from("pipe_drawer_entries" as any)
        .select("*")
        .eq("measurement_id", measurementId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((d: any) => ({
        id: d.id,
        mid: d.mid || "",
        left: d.left || "",
        right: d.right || "",
        slides_length: d.slides_length || "",
        drawer_height: d.drawer_height || "",
        drawer_label: d.drawer_label || "",
        quantity: d.quantity || 1,
      })) as PipeDrawerEntry[];
    },
    enabled: !!measurementId,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: Omit<PipeDrawerEntry, "id">) => {
      if (!measurementId || !organization?.id) throw new Error("Missing context");
      const { error } = await supabase.from("pipe_drawer_entries" as any).insert({
        measurement_id: measurementId,
        organization_id: organization.id,
        mid: entry.mid,
        left: entry.left,
        right: entry.right,
        slides_length: entry.slides_length,
        drawer_height: entry.drawer_height,
        drawer_label: entry.drawer_label,
        quantity: entry.quantity,
        sort_order: entries.length,
      } as any);
      if (error) {
        console.error("Failed to save pipe drawer entry:", error);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pipe-drawer-entries", measurementId] }),
    onError: (err) => {
      console.error("Mutation error saving entry:", err);
      toast.error("Failed to save entry");
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pipe_drawer_entries" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pipe-drawer-entries", measurementId] }),
    onError: () => toast.error("Failed to delete entry"),
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PipeDrawerEntry> }) => {
      const { error } = await supabase.from("pipe_drawer_entries" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pipe-drawer-entries", measurementId] }),
    onError: () => toast.error("Failed to update entry"),
  });

  if (measurementLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
          {measurement?.notes || "Pipe Drawer Measurements"}
        </h1>
        <PipeDrawerDiagram
          title={measurement?.notes || "Pipe Drawer Measurements"}
          entries={entries}
          isLoading={entriesLoading}
          onAddEntry={(entry) => addEntryMutation.mutate(entry)}
          onDeleteEntry={(id) => deleteEntryMutation.mutate(id)}
          onUpdateEntry={(id, updates) => updateEntryMutation.mutate({ id, updates })}
        />
      </div>
    </DashboardLayout>
  );
};

export default PipeDrawerEditor;
