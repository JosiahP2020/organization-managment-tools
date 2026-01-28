import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface MenuItem {
  id: string;
  organization_id: string;
  category_id: string;
  name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  item_type: "submenu" | "file_directory" | "tool";
  target_category_id: string | null;
  is_searchable: boolean;
  tool_type: "checklist" | "sop_guide" | "project_hub" | null;
  tool_mode: "unlimited" | "single";
  tool_is_searchable: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuItemInput {
  category_id: string;
  name: string;
  description?: string;
  icon?: string;
  item_type: "submenu" | "file_directory" | "tool";
  target_category_id?: string | null;
  is_searchable?: boolean;
  tool_type?: "checklist" | "sop_guide" | "project_hub" | null;
  tool_mode?: "unlimited" | "single";
  tool_is_searchable?: boolean;
}

export interface UpdateMenuItemInput {
  id: string;
  name?: string;
  description?: string | null;
  icon?: string;
  sort_order?: number;
  item_type?: "submenu" | "file_directory" | "tool";
  target_category_id?: string | null;
  is_searchable?: boolean;
  tool_type?: "checklist" | "sop_guide" | "project_hub" | null;
  tool_mode?: "unlimited" | "single";
  tool_is_searchable?: boolean;
}

export function useMenuItems(categoryId?: string) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["menu-items", organization?.id, categoryId],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      let query = supabase
        .from("menu_items")
        .select("*")
        .eq("organization_id", organization.id)
        .order("sort_order", { ascending: true });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!organization?.id,
  });

  const createItem = useMutation({
    mutationFn: async (input: CreateMenuItemInput) => {
      if (!organization?.id || !user?.id) throw new Error("Not authenticated");

      // Get max sort_order for new item in category
      const { data: existing } = await supabase
        .from("menu_items")
        .select("sort_order")
        .eq("organization_id", organization.id)
        .eq("category_id", input.category_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          category_id: input.category_id,
          name: input.name,
          description: input.description || null,
          icon: input.icon || "file",
          item_type: input.item_type,
          target_category_id: input.target_category_id || null,
          is_searchable: input.is_searchable ?? true,
          tool_type: input.tool_type || null,
          tool_mode: input.tool_mode || "unlimited",
          tool_is_searchable: input.tool_is_searchable ?? true,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({ title: "Item created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create item", description: error.message, variant: "destructive" });
    },
  });

  const updateItem = useMutation({
    mutationFn: async (input: UpdateMenuItemInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({ title: "Item updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update item", description: error.message, variant: "destructive" });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete item", description: error.message, variant: "destructive" });
    },
  });

  const reorderItems = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("menu_items")
          .update({ sort_order: index })
          .eq("id", id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}
