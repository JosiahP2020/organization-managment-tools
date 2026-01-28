import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SidebarCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  sort_order: number;
  show_in_sidebar: boolean;
  show_on_dashboard: boolean;
  parent_category_id: string | null;
  organization_id: string;
}

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  item_type: string;
  tool_type: string | null;
  tool_mode: string;
  is_searchable: boolean;
  sort_order: number;
  category_id: string;
  target_category_id: string | null;
}

export function useSidebarCategories() {
  const { organization } = useAuth();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["sidebar-categories", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("show_in_sidebar", true)
        .is("parent_category_id", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as SidebarCategory[];
    },
    enabled: !!organization?.id,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["sidebar-items", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("organization_id", organization.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as SidebarItem[];
    },
    enabled: !!organization?.id,
  });

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }
    acc[item.category_id].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  return {
    categories,
    itemsByCategory,
    isLoading: categoriesLoading || itemsLoading,
  };
}
