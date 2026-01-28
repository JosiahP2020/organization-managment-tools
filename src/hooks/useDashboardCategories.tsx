import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardCategory {
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

export function useDashboardCategories() {
  const { organization } = useAuth();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["dashboard-categories", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("show_on_dashboard", true)
        .is("parent_category_id", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as DashboardCategory[];
    },
    enabled: !!organization?.id,
  });

  return {
    categories,
    isLoading,
    error,
  };
}
