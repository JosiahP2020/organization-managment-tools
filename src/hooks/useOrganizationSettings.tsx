import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type DashboardLayout = 'full-width' | 'grid-right-column' | 'sidebar-left' | 'masonry';
export type CardStyle = 'left-accent' | 'stat-card' | 'clean-minimal';

interface OrganizationSettings {
  dashboard_layout: DashboardLayout;
  card_style: CardStyle;
}

export function useOrganizationSettings() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['organization-settings', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('dashboard_layout, card_style')
        .eq('id', organization.id)
        .single();
      
      if (error) throw error;
      return data as OrganizationSettings;
    },
    enabled: !!organization?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<OrganizationSettings>) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings', organization?.id] });
    },
  });

  return {
    dashboardLayout: (settings?.dashboard_layout || 'grid-right-column') as DashboardLayout,
    cardStyle: (settings?.card_style || 'left-accent') as CardStyle,
    isLoading,
    updateSettings,
  };
}
