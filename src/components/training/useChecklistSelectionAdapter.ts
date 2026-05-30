import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectionAdapter } from "@/components/selection";
import type { SelectionAdapter } from "@/components/selection";

/**
 * Selection adapter for checklist items within one checklist.
 * surface: checklist:<checklistId>
 */
export function useChecklistSelectionAdapter(checklistId: string | undefined) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const surface = checklistId ? `checklist:${checklistId}` : null;

  const invalidate = useCallback(() => {
    if (!checklistId) return;
    queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
  }, [queryClient, checklistId]);

  const adapter = useMemo<SelectionAdapter | null>(() => {
    if (!surface || !isAdmin) return null;

    return {
      surface,
      surfaceLabel: "Checklist items",
      canRename: true,
      canMove: false,
      canCopy: false,
      canDelete: true,
      rename: async (id, newText) => {
        const { error } = await supabase
          .from("checklist_items")
          .update({ text: newText })
          .eq("id", id);
        if (error) throw error;
        invalidate();
      },
      delete: async (ids) => {
        // Also delete children
        await supabase.from("checklist_items").delete().in("parent_item_id", ids);
        const { error } = await supabase
          .from("checklist_items")
          .delete()
          .in("id", ids);
        if (error) throw error;
        invalidate();
      },
    };
  }, [surface, isAdmin, invalidate]);

  useSelectionAdapter(adapter);
  return surface;
}
