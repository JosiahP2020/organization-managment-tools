import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectionAdapter } from "@/components/selection";
import type { MoveTarget, SelectionAdapter } from "@/components/selection";

/**
 * Registers a selection adapter for a menu category surface.
 * Wires up delete / rename / move / copy for menu items.
 */
export function useMenuSelectionAdapter(categoryId: string | undefined) {
  const { organization, user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const surface = categoryId ? `menu:${categoryId}` : null;

  // Load all categories + section headers for move/copy targets
  const { data: targetData } = useQuery({
    queryKey: ["menu-move-targets", organization?.id, categoryId],
    queryFn: async () => {
      if (!organization?.id) return { categories: [], sections: [] };

      const [{ data: cats }, { data: secs }] = await Promise.all([
        supabase
          .from("menu_categories")
          .select("id, name, show_on_dashboard, show_in_sidebar")
          .eq("organization_id", organization.id)
          .order("name"),
        supabase
          .from("menu_items")
          .select("id, name, category_id")
          .eq("organization_id", organization.id)
          .eq("item_type", "section")
          .order("name"),
      ]);

      return { categories: cats || [], sections: secs || [] };
    },
    enabled: !!organization?.id && isAdmin,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
  }, [queryClient]);

  const adapter = useMemo<SelectionAdapter | null>(() => {
    if (!surface || !categoryId || !isAdmin || !organization?.id || !user?.id) return null;

    const rename = async (id: string, newName: string) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      invalidate();
    };

    const deleteIds = async (ids: string[]) => {
      // Get items first to find submenus needing category cleanup
      const { data: items } = await supabase
        .from("menu_items")
        .select("id, item_type, target_category_id")
        .in("id", ids);

      // Unlink any section children
      await supabase.from("menu_items").update({ section_id: null }).in("section_id", ids);

      const { error } = await supabase.from("menu_items").delete().in("id", ids);
      if (error) throw error;

      // Cascade submenu categories
      const submenuCats = (items || [])
        .filter((i) => i.item_type === "submenu" && i.target_category_id)
        .map((i) => i.target_category_id as string);
      if (submenuCats.length) {
        await supabase.from("menu_items").delete().in("category_id", submenuCats);
        await supabase.from("menu_categories").delete().in("id", submenuCats);
      }
      invalidate();
    };

    const listMoveTargets = (): MoveTarget[] => {
      const targets: MoveTarget[] = [];
      const cats = targetData?.categories || [];
      const secs = targetData?.sections || [];

      // Sections inside the current category
      const ownSections = secs.filter((s) => s.category_id === categoryId);
      ownSections.forEach((s) =>
        targets.push({ id: `section:${s.id}`, label: s.name, group: "This menu" })
      );

      // Other menus (categories) - send to default (no section) of that menu
      cats
        .filter((c) => c.id !== categoryId && (c.show_on_dashboard || c.show_in_sidebar))
        .forEach((c) =>
          targets.push({ id: `category:${c.id}`, label: c.name, group: "Other menus" })
        );

      return targets;
    };

    const parseTarget = (target: MoveTarget) => {
      const [kind, id] = target.id.split(":");
      return { kind: kind as "section" | "category", id };
    };

    const nextSortOrder = async (catId: string, sectionId: string | null) => {
      let q = supabase
        .from("menu_items")
        .select("sort_order")
        .eq("category_id", catId)
        .neq("item_type", "section")
        .order("sort_order", { ascending: false })
        .limit(1);
      q = sectionId ? q.eq("section_id", sectionId) : q.is("section_id", null);
      const { data } = await q;
      return data?.[0]?.sort_order != null ? data[0].sort_order + 1 : 0;
    };

    const move = async (ids: string[], target: MoveTarget) => {
      const { kind, id } = parseTarget(target);
      const targetCategoryId = kind === "category" ? id : categoryId;
      const targetSectionId = kind === "section" ? id : null;

      let so = await nextSortOrder(targetCategoryId, targetSectionId);
      for (const itemId of ids) {
        const { error } = await supabase
          .from("menu_items")
          .update({
            category_id: targetCategoryId,
            section_id: targetSectionId,
            sort_order: so++,
          })
          .eq("id", itemId);
        if (error) throw error;
      }
      invalidate();
    };

    const copy = async (ids: string[], target: MoveTarget) => {
      const { kind, id } = parseTarget(target);
      const targetCategoryId = kind === "category" ? id : categoryId;
      const targetSectionId = kind === "section" ? id : null;

      // Load source rows
      const { data: sources, error: srcErr } = await supabase
        .from("menu_items")
        .select("*")
        .in("id", ids);
      if (srcErr) throw srcErr;
      if (!sources) return;

      let so = await nextSortOrder(targetCategoryId, targetSectionId);

      for (const src of sources) {
        let newTargetCategoryId = src.target_category_id;

        // For submenus, create a fresh empty linked category
        if (src.item_type === "submenu") {
          const { data: newCat, error: ce } = await supabase
            .from("menu_categories")
            .insert({
              name: src.name,
              icon: src.icon,
              organization_id: organization.id,
              created_by: user.id,
              show_on_dashboard: false,
              show_in_sidebar: false,
            })
            .select()
            .single();
          if (ce) throw ce;
          newTargetCategoryId = newCat.id;
        }

        const { data: newItem, error: insErr } = await supabase
          .from("menu_items")
          .insert({
            name: `${src.name} (Copy)`,
            description: src.description,
            icon: src.icon,
            item_type: src.item_type,
            tool_type: src.tool_type,
            tool_mode: src.tool_mode,
            tool_is_searchable: src.tool_is_searchable,
            is_searchable: src.is_searchable,
            target_category_id: newTargetCategoryId,
            category_id: targetCategoryId,
            section_id: targetSectionId,
            organization_id: organization.id,
            created_by: user.id,
            sort_order: so++,
          })
          .select()
          .single();
        if (insErr) throw insErr;

        // For tools, link to same document (shares underlying data)
        if (src.item_type === "tool") {
          const { data: srcDoc } = await supabase
            .from("menu_item_documents")
            .select("document_id, document_type, title")
            .eq("menu_item_id", src.id)
            .maybeSingle();
          if (srcDoc) {
            await supabase.from("menu_item_documents").insert({
              menu_item_id: newItem.id,
              document_id: srcDoc.document_id,
              document_type: srcDoc.document_type,
              title: newItem.name,
              organization_id: organization.id,
              created_by: user.id,
            });
          }
        }
      }
      invalidate();
    };

    return {
      surface,
      surfaceLabel: "Menu items",
      canRename: true,
      canMove: true,
      canCopy: true,
      canDelete: true,
      rename,
      delete: deleteIds,
      move,
      copy,
      listMoveTargets,
    };
  }, [surface, categoryId, isAdmin, organization?.id, user?.id, targetData, invalidate]);

  useSelectionAdapter(adapter);
}
