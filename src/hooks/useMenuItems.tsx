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
  target_category_id: string | null;
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
          title: "New Section",
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

  // Create a new submenu item (also creates a linked category for nesting)
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

      // First, create a new menu_category for this submenu (hidden from dashboard/sidebar)
      const { data: newCategory, error: categoryError } = await supabase
        .from("menu_categories")
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          icon,
          organization_id: organization.id,
          created_by: user.id,
          show_on_dashboard: false,
          show_in_sidebar: false,
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

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

      // Create the menu_item linking to the new category
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
          target_category_id: newCategory.id,
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

  // Create a new file directory item
  const createFileDirectory = useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      icon = "folder-open",
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

      // Create the file_directory menu item
      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          icon,
          item_type: "file_directory",
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
      toast.success("File directory created");
    },
    onError: (error) => {
      console.error("Failed to create file directory:", error);
      toast.error("Failed to create file directory");
    },
  });

  const createSection = useMutation({
    mutationFn: async ({ title, afterSectionId }: { title: string; afterSectionId?: string }) => {
      if (!organization?.id || !user?.id || !categoryId) {
        throw new Error("Not authenticated");
      }

      // Fetch all existing sections to determine sort order
      const { data: existingSections } = await supabase
        .from("menu_items")
        .select("id, sort_order")
        .eq("category_id", categoryId)
        .eq("item_type", "section")
        .order("sort_order", { ascending: true });

      const sections = existingSections || [];
      
      let newSortOrder: number;
      
      if (afterSectionId && afterSectionId !== "default") {
        // Find the section we're inserting after
        const afterIndex = sections.findIndex(s => s.id === afterSectionId);
        if (afterIndex !== -1) {
          const afterSortOrder = sections[afterIndex].sort_order;
          const nextSection = sections[afterIndex + 1];
          
          // Shift all subsequent sections down
          for (let i = afterIndex + 1; i < sections.length; i++) {
            await supabase
              .from("menu_items")
              .update({ sort_order: sections[i].sort_order + 1 })
              .eq("id", sections[i].id);
          }
          
          newSortOrder = afterSortOrder + 1;
        } else {
          // Fallback to end
          newSortOrder = sections.length > 0 ? sections[sections.length - 1].sort_order + 1 : 0;
        }
      } else if (afterSectionId === "default") {
        // Insert after the default section (which has sort_order -1), so before all other sections
        // Shift all existing sections down
        for (const section of sections) {
          await supabase
            .from("menu_items")
            .update({ sort_order: section.sort_order + 1 })
            .eq("id", section.id);
        }
        newSortOrder = 0;
      } else {
        // No context, append to end
        newSortOrder = sections.length > 0 ? sections[sections.length - 1].sort_order + 1 : 0;
      }

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: title.trim(),
          item_type: "section",
          category_id: categoryId,
          organization_id: organization.id,
          created_by: user.id,
          sort_order: newSortOrder,
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
      // Special handling for the default section - create a real section record
      if (itemId === "default") {
        if (!organization?.id || !user?.id || !categoryId) {
          throw new Error("Not authenticated");
        }

        // Create a new section record with this name
        const { data: newSection, error: sectionError } = await supabase
          .from("menu_items")
          .insert({
            name: name.trim(),
            item_type: "section",
            category_id: categoryId,
            organization_id: organization.id,
            created_by: user.id,
            sort_order: -1, // Keep it first
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Move all items with section_id = null to this new section
        const { error: updateError } = await supabase
          .from("menu_items")
          .update({ section_id: newSection.id })
          .eq("category_id", categoryId)
          .is("section_id", null)
          .neq("item_type", "section");

        if (updateError) throw updateError;

        return newSection;
      }

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

      // First, get the item to check if it's a submenu with a linked category
      const { data: item } = await supabase
        .from("menu_items")
        .select("item_type, target_category_id")
        .eq("id", itemId)
        .single();

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

      // If it was a submenu with a linked category, delete that category too
      if (item?.item_type === "submenu" && item?.target_category_id) {
        // First delete any menu items in that category
        await supabase
          .from("menu_items")
          .delete()
          .eq("category_id", item.target_category_id);

        // Then delete the category itself
        await supabase
          .from("menu_categories")
          .delete()
          .eq("id", item.target_category_id);
      }
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

  // Move section up
  const moveSectionUp = useMutation({
    mutationFn: async (sectionId: string) => {
      // Find current sections (excluding default)
      const realSections = sections.filter(s => s.id !== "default");
      const currentIndex = realSections.findIndex(s => s.id === sectionId);
      
      if (currentIndex <= 0) return; // Already at top or not found
      
      const prevSection = realSections[currentIndex - 1];
      const currentSection = realSections[currentIndex];
      
      // Swap sort_orders
      await supabase
        .from("menu_items")
        .update({ sort_order: prevSection.sort_order })
        .eq("id", sectionId)
        .eq("item_type", "section");
        
      await supabase
        .from("menu_items")
        .update({ sort_order: currentSection.sort_order })
        .eq("id", prevSection.id)
        .eq("item_type", "section");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
    },
    onError: (error) => {
      console.error("Failed to move section:", error);
      toast.error("Failed to move section");
    },
  });

  // Move section down
  const moveSectionDown = useMutation({
    mutationFn: async (sectionId: string) => {
      // Find current sections (excluding default)
      const realSections = sections.filter(s => s.id !== "default");
      const currentIndex = realSections.findIndex(s => s.id === sectionId);
      
      if (currentIndex === -1 || currentIndex >= realSections.length - 1) return; // At bottom or not found
      
      const nextSection = realSections[currentIndex + 1];
      const currentSection = realSections[currentIndex];
      
      // Swap sort_orders
      await supabase
        .from("menu_items")
        .update({ sort_order: nextSection.sort_order })
        .eq("id", sectionId)
        .eq("item_type", "section");
        
      await supabase
        .from("menu_items")
        .update({ sort_order: currentSection.sort_order })
        .eq("id", nextSection.id)
        .eq("item_type", "section");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
    },
    onError: (error) => {
      console.error("Failed to move section:", error);
      toast.error("Failed to move section");
    },
  });

  // Move item up within section
  const moveItemUp = useMutation({
    mutationFn: async ({ itemId, sectionId }: { itemId: string; sectionId: string }) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const currentIndex = section.items.findIndex(i => i.id === itemId);
      if (currentIndex <= 0) return;
      
      const prevItem = section.items[currentIndex - 1];
      const currentItem = section.items[currentIndex];
      
      await supabase
        .from("menu_items")
        .update({ sort_order: prevItem.sort_order })
        .eq("id", itemId);
        
      await supabase
        .from("menu_items")
        .update({ sort_order: currentItem.sort_order })
        .eq("id", prevItem.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
    },
    onError: (error) => {
      console.error("Failed to move item:", error);
      toast.error("Failed to move item");
    },
  });

  // Move item down within section
  const moveItemDown = useMutation({
    mutationFn: async ({ itemId, sectionId }: { itemId: string; sectionId: string }) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const currentIndex = section.items.findIndex(i => i.id === itemId);
      if (currentIndex === -1 || currentIndex >= section.items.length - 1) return;
      
      const nextItem = section.items[currentIndex + 1];
      const currentItem = section.items[currentIndex];
      
      await supabase
        .from("menu_items")
        .update({ sort_order: nextItem.sort_order })
        .eq("id", itemId);
        
      await supabase
        .from("menu_items")
        .update({ sort_order: currentItem.sort_order })
        .eq("id", nextItem.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", categoryId] });
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
    createFileDirectory,
    createSection,
    updateItemName,
    deleteItem,
    reorderItems,
    moveItem,
    moveSectionUp,
    moveSectionDown,
    moveItemUp,
    moveItemDown,
  };
}
