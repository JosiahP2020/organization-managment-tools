import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type WidgetType = "recent_activity" | "pinned_items" | "document_stats" | "quick_links" | "progress";
export type DisplayType = "list" | "counter" | "progress_bar" | "quick_links" | "table";
export type WidgetSize = "small" | "medium" | "large";

export interface WidgetConfig {
  category_filter?: string;
  date_range?: "7d" | "30d" | "all";
  limit?: number;
  display_type?: DisplayType;
  status_filter?: string;
  links?: Array<{ title: string; document_id: string; icon: string }>;
  show_checklists?: boolean;
  show_guides?: boolean;
  show_files?: boolean;
}

export interface Widget {
  id: string;
  organization_id: string;
  widget_type: WidgetType;
  name: string;
  config: WidgetConfig;
  position: number;
  size: WidgetSize;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export function useWidgets(location?: "dashboard" | "menu", menuItemId?: string) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch widgets
  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ["widgets", organization?.id, location, menuItemId],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from("dashboard_widgets")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("is_visible", true)
        .order("position", { ascending: true });

      if (error) throw error;
      
      // Type cast the data properly
      return (data || []).map(widget => ({
        ...widget,
        widget_type: widget.widget_type as WidgetType,
        size: widget.size as WidgetSize,
        config: widget.config as WidgetConfig,
      })) as Widget[];
    },
    enabled: !!organization?.id,
  });

  // Create a widget
  const createWidget = useMutation({
    mutationFn: async (input: {
      widget_type: WidgetType;
      name: string;
      config: WidgetConfig;
      size?: WidgetSize;
    }) => {
      if (!organization?.id || !user?.id) {
        throw new Error("Missing required data");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .insert([{
          organization_id: organization.id,
          widget_type: input.widget_type,
          name: input.name,
          config: JSON.parse(JSON.stringify(input.config)),
          size: input.size || "medium",
          position: widgets.length,
          is_visible: true,
        }] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget created successfully");
    },
    onError: (error) => {
      console.error("Error creating widget:", error);
      toast.error("Failed to create widget");
    },
  });

  // Update a widget
  const updateWidget = useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      config?: WidgetConfig;
      size?: WidgetSize;
      position?: number;
      is_visible?: boolean;
    }) => {
      const { id, config, ...rest } = input;

      const updates: Record<string, unknown> = { ...rest };
      if (config) {
        updates.config = config as unknown as Record<string, unknown>;
      }

      const { error } = await supabase
        .from("dashboard_widgets")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget updated successfully");
    },
    onError: (error) => {
      console.error("Error updating widget:", error);
      toast.error("Failed to update widget");
    },
  });

  // Delete a widget
  const deleteWidget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dashboard_widgets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting widget:", error);
      toast.error("Failed to delete widget");
    },
  });

  return {
    widgets,
    isLoading,
    createWidget,
    updateWidget,
    deleteWidget,
  };
}
