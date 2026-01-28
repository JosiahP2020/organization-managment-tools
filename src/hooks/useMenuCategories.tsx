import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface MenuCategory {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  parent_category_id: string | null;
  show_on_dashboard: boolean;
  show_in_sidebar: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  parent_category_id?: string | null;
  show_on_dashboard?: boolean;
  show_in_sidebar?: boolean;
}

export interface UpdateMenuCategoryInput {
  id: string;
  name?: string;
  description?: string | null;
  icon?: string;
  sort_order?: number;
  parent_category_id?: string | null;
  show_on_dashboard?: boolean;
  show_in_sidebar?: boolean;
}

export function useMenuCategories() {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["menu-categories", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("organization_id", organization.id)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as MenuCategory[];
    },
    enabled: !!organization?.id,
  });

  const createCategory = useMutation({
    mutationFn: async (input: CreateMenuCategoryInput) => {
      if (!organization?.id || !user?.id) throw new Error("Not authenticated");

      // Get max sort_order for new category
      let query = supabase
        .from("menu_categories")
        .select("sort_order")
        .eq("organization_id", organization.id);
      
      // Use .is() for null comparison, .eq() for actual IDs
      if (input.parent_category_id) {
        query = query.eq("parent_category_id", input.parent_category_id);
      } else {
        query = query.is("parent_category_id", null);
      }
      
      const { data: existing } = await query
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from("menu_categories")
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          name: input.name,
          description: input.description || null,
          icon: input.icon || "folder",
          parent_category_id: input.parent_category_id || null,
          show_on_dashboard: input.show_on_dashboard ?? true,
          show_in_sidebar: input.show_in_sidebar ?? true,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MenuCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-categories"] });
      toast({ title: "Category created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create category", description: error.message, variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (input: UpdateMenuCategoryInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from("menu_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MenuCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete category", description: error.message, variant: "destructive" });
    },
  });

  const reorderCategories = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("menu_categories")
          .update({ sort_order: index })
          .eq("id", id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
    },
  });

  // Get top-level categories (no parent)
  const topLevelCategories = categoriesQuery.data?.filter(c => !c.parent_category_id) || [];

  // Get children of a category
  const getChildren = (parentId: string) => 
    categoriesQuery.data?.filter(c => c.parent_category_id === parentId) || [];

  return {
    categories: categoriesQuery.data || [],
    topLevelCategories,
    getChildren,
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
