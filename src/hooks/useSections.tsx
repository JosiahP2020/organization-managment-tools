import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Section {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  category_id: string;
  sort_order: number;
}

export function useSections(categoryId: string | undefined) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sections for a category (sections are menu_items with item_type = 'section')
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["sections", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("category_id", categoryId)
        .eq("item_type", "section")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Section[];
    },
    enabled: !!categoryId,
  });

  // Create a new section
  const createSection = useMutation({
    mutationFn: async (input: { name: string; description?: string; icon: string }) => {
      if (!organization?.id || !user?.id || !categoryId) {
        throw new Error("Missing required data");
      }

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: input.name,
          description: input.description || null,
          icon: input.icon,
          item_type: "section",
          category_id: categoryId,
          organization_id: organization.id,
          created_by: user.id,
          sort_order: sections.length,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["category-items", categoryId] });
      toast.success("Section created successfully");
    },
    onError: (error) => {
      console.error("Error creating section:", error);
      toast.error("Failed to create section");
    },
  });

  // Update a section
  const updateSection = useMutation({
    mutationFn: async (input: { id: string; name?: string; description?: string | null; icon?: string }) => {
      const { id, ...updates } = input;

      const { error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["category-items", categoryId] });
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
    },
  });

  // Delete a section (items in the section become ungrouped)
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      // First, ungroup all items in this section
      await supabase
        .from("menu_items")
        .update({ section_id: null })
        .eq("section_id", id);

      // Then delete the section
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["category-items", categoryId] });
      toast.success("Section deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section");
    },
  });

  return {
    sections,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
  };
}
