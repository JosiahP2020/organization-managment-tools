import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectionAdapter } from "@/components/selection";
import type { SelectionAdapter } from "@/components/selection";

/**
 * Selection adapter for the project list.
 * surface: projects
 */
export function useProjectSelectionAdapter() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const surface = "projects";

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects-archived"] });
  }, [queryClient]);

  const adapter = useMemo<SelectionAdapter | null>(() => {
    if (!isAdmin) return null;

    return {
      surface,
      surfaceLabel: "Projects",
      canRename: true,
      canMove: false,
      canCopy: false,
      canDelete: true,
      rename: async (id, newName) => {
        const { error } = await supabase
          .from("projects")
          .update({ title: newName })
          .eq("id", id);
        if (error) throw error;
        invalidate();
      },
      delete: async (ids) => {
        const { error } = await supabase.from("projects").delete().in("id", ids);
        if (error) throw error;
        invalidate();
      },
    };
  }, [isAdmin, invalidate]);

  useSelectionAdapter(adapter);
  return surface;
}
