import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectionAdapter } from "@/components/selection";
import type { MoveTarget, SelectionAdapter } from "@/components/selection";

/**
 * Selection adapter for dashboard category cards.
 * Supports rename, delete, and move between dashboard sections.
 */
export function useDashboardSelectionAdapter() {
  const { organization, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const surface = "dashboard:categories";

  const { data: sections } = useQuery({
    queryKey: ["dashboard-sections-targets", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data } = await supabase
        .from("dashboard_sections")
        .select("id, title")
        .eq("organization_id", organization.id)
        .order("sort_order");
      return data || [];
    },
    enabled: !!organization?.id && isAdmin,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
  }, [queryClient]);

  const adapter = useMemo<SelectionAdapter | null>(() => {
    if (!isAdmin || !organization?.id) return null;

    return {
      surface,
      surfaceLabel: "Dashboard cards",
      canRename: true,
      canMove: true,
      canCopy: false,
      canDelete: true,
      rename: async (id, newName) => {
        const { error } = await supabase
          .from("menu_categories")
          .update({ name: newName })
          .eq("id", id);
        if (error) throw error;
        invalidate();
      },
      delete: async (ids) => {
        // Delete linked items first
        await supabase.from("menu_items").delete().in("category_id", ids);
        const { error } = await supabase
          .from("menu_categories")
          .delete()
          .in("id", ids);
        if (error) throw error;
        invalidate();
      },
      move: async (ids, target) => {
        const [, sectionId] = target.id.split(":");
        const realSectionId = sectionId === "default" ? null : sectionId;
        const { error } = await supabase
          .from("menu_categories")
          .update({ section_id: realSectionId })
          .in("id", ids);
        if (error) throw error;
        invalidate();
      },
      listMoveTargets: (): MoveTarget[] => {
        const targets: MoveTarget[] = [
          { id: "section:default", label: "Main (no section)", group: "Sections" },
        ];
        (sections || []).forEach((s) =>
          targets.push({ id: `section:${s.id}`, label: s.title, group: "Sections" })
        );
        return targets;
      },
    };
  }, [isAdmin, organization?.id, sections, invalidate]);

  useSelectionAdapter(adapter);
  return surface;
}
