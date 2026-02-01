import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  item_type: string;
  category_id: string;
  section_id: string | null;
  sort_order: number;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemSection {
  id: string;
  title: string;
  sort_order: number;
  items: MenuItem[];
}

export function useMenuItems(categoryId: string | undefined) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch menu items for a category, grouped by section
  const { data: sections = [], isLoading, error } = useQuery({
    queryKey: ["menu-items", categoryId],
    queryFn: async () => {
      if (!categoryId || !organization?.id) return [];

      // Fetch all menu items for this category
      const { data: items, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("category_id", categoryId)
        .eq("organization_id", organization.id)
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      // Group items by section_id
      // Items with section_id === null go into a default section
      // Items with item_type === "section" are section headers
      const sectionItems = (items || []).filter(item => item.item_type === "section");
      const regularItems = (items || []).filter(item => item.item_type !== "section");

      const itemsBySection = new Map<string | null, MenuItem[]>();

      for (const item of regularItems) {
        const sectionId = item.section_id;
        if (!itemsBySection.has(sectionId)) {
          itemsBySection.set(sectionId, []);
        }
        itemsBySection.get(sectionId)!.push(item as MenuItem);
      }

      // Build sections array
      const result: MenuItemSection[] = [];

      // Default section for items without a section
      const unsortedItems = itemsBySection.get(null) || [];
      if (unsortedItems.length > 0 || sectionItems.length === 0) {
        result.push({
          id: "default",
          title: "Items",
          sort_order: -1,
          items: unsortedItems,
        });
      }

      // Add actual sections
      for (const section of sectionItems.sort((a, b) => a.sort_order - b.sort_order)) {
        result.push({
          id: section.id,
          title: section.name,
          sort_order: section.sort_order,
          items: itemsBySection.get(section.id) || [],
        });
      }

      return result;
    },
    enabled: !!categoryId && !!organization?.id,
  });

  // Create a new submenu item
  const createSubmenu = useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      icon = "folder",
      sectionId 
    }: { 
      name: string; 
      description?: string; 
      icon?: string;
      sectionId?: string | null;
    }) => {
      if (!organization?.id || !user?.id || !categoryId) {
        throw new Error("Not authenticated");
      }

      // Get max sort_order for this category
      const { data: existingItems } = await supabase
        .from("menu_items")
        .select("sort_order")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextSortOrder = existingItems?.[0]?.sort_order 
        ? existingItems[0].sort_order + 1 
        : 0;

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          icon,
          item_type: "submenu",
          category_id: categoryId,
          section_id: sectionId && sectionId !== "default" ? sectionId : null,
          organization_id: organization.id,
          created_by: user.id,
          sort_order: nextSortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
      toast.success("Submenu created");
    },
    onError: (error) => {
      console.error("Failed to create submenu:", error);
      toast.error("Failed to create submenu");
    },
  });

  // Create a new section
  const createSection = useMutation({
    mutationFn: async (title: string) => {
      if (!organization?.id || !user?.id || !categoryId) {
        throw new Error("Not authenticated");
      }

      // Get max sort_order for sections in this category
      const { data: existingSections } = await supabase
        .from("menu_items")
        .select("sort_order")
        .eq("category_id", categoryId)
        .eq("item_type", "section")
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextSortOrder = existingSections?.[0]?.sort_order 
        ? existingSections[0].sort_order + 1 
        : 0;

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: title.trim(),
          item_type: "section",
          category_id: categoryId,
          organization_id: organization.id,
          created_by: user.id,
          sort_order: nextSortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
      toast.success("Section created");
    },
    onError: (error) => {
      console.error("Failed to create section:", error);
      toast.error("Failed to create section");
    },
  });

  // Update item/section name
  const updateItemName = useMutation({
    mutationFn: async ({ itemId, name }: { itemId: string; name: string }) => {
      if (itemId === "default") return { id: "default", name };

      const { data, error } = await supabase
        .from("menu_items")
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
    },
    onError: (error) => {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    },
  });

  // Delete an item or section
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (itemId === "default") {
        throw new Error("Cannot delete default section");
      }

      // If it's a section, unlink all items first
      const { error: unlinkError } = await supabase
        .from("menu_items")
        .update({ section_id: null })
        .eq("section_id", itemId);

      if (unlinkError) throw unlinkError;

      // Delete the item/section
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
      toast.success("Deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete");
    },
  });

  // Reorder items within a section
  const reorderItems = useMutation({
    mutationFn: async ({ sectionId, itemIds }: { sectionId: string; itemIds: string[] }) => {
      for (let i = 0; i < itemIds.length; i++) {
        const { error } = await supabase
          .from("menu_items")
          .update({ sort_order: i })
          .eq("id", itemIds[i]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
    },
    onError: (error) => {
      console.error("Failed to reorder items:", error);
      toast.error("Failed to reorder items");
    },
  });

  // Move an item to a different section
  const moveItem = useMutation({
    mutationFn: async ({ 
      itemId, 
      targetSectionId, 
      newSortOrder 
    }: { 
      itemId: string; 
      targetSectionId: string | null; 
      newSortOrder: number;
    }) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ 
          section_id: targetSectionId === "default" ? null : targetSectionId,
          sort_order: newSortOrder,
        })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
      toast.success("Item moved");
    },
    onError: (error) => {
      console.error("Failed to move item:", error);
      toast.error("Failed to move item");
    },
  });

  return {
    sections,
    isLoading,
    error,
    createSubmenu,
    createSection,
    updateItemName,
    deleteItem,
    reorderItems,
    moveItem,
  };
}
