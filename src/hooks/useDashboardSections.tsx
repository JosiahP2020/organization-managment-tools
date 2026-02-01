import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { DashboardCategory } from "./useDashboardCategories";

export interface DashboardSection {
  id: string;
  title: string;
  sort_order: number;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SectionWithCategories extends DashboardSection {
  categories: DashboardCategory[];
}

export function useDashboardSections() {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sections
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["dashboard-sections", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("dashboard_sections")
        .select("*")
        .eq("organization_id", organization.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as DashboardSection[];
    },
    enabled: !!organization?.id,
  });

  // Fetch categories with section info
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["dashboard-categories-with-sections", organization?.id],
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
      return data as (DashboardCategory & { section_id: string | null })[];
    },
    enabled: !!organization?.id,
  });

  // Group categories by section
  const sectionsWithCategories: SectionWithCategories[] = sections.map(section => ({
    ...section,
    categories: categories.filter(cat => cat.section_id === section.id),
  }));

  // Categories without a section (unsorted)
  const unsortedCategories = categories.filter(cat => !cat.section_id);

  // Create section mutation
  const createSection = useMutation({
    mutationFn: async (title: string) => {
      if (!organization?.id || !user?.id) {
        throw new Error("Organization or user not found");
      }

      const maxSortOrder = sections.length > 0 
        ? Math.max(...sections.map(s => s.sort_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from("dashboard_sections")
        .insert({
          title: title.trim(),
          organization_id: organization.id,
          created_by: user.id,
          sort_order: maxSortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      toast.success("Section created successfully");
    },
    onError: (error) => {
      console.error("Failed to create section:", error);
      toast.error("Failed to create section");
    },
  });

  // Update section title mutation
  const updateSection = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("dashboard_sections")
        .update({ title: title.trim() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      toast.success("Section updated");
    },
    onError: (error) => {
      console.error("Failed to update section:", error);
      toast.error("Failed to update section");
    },
  });

  // Delete section mutation
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dashboard_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories-with-sections"] });
      toast.success("Section deleted");
    },
    onError: (error) => {
      console.error("Failed to delete section:", error);
      toast.error("Failed to delete section");
    },
  });

  // Move category to section
  const moveCategoryToSection = useMutation({
    mutationFn: async ({ categoryId, sectionId }: { categoryId: string; sectionId: string | null }) => {
      const { error } = await supabase
        .from("menu_categories")
        .update({ section_id: sectionId })
        .eq("id", categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories-with-sections"] });
    },
    onError: (error) => {
      console.error("Failed to move category:", error);
      toast.error("Failed to move category");
    },
  });

  return {
    sections,
    sectionsWithCategories,
    unsortedCategories,
    isLoading: sectionsLoading || categoriesLoading,
    createSection,
    updateSection,
    deleteSection,
    moveCategoryToSection,
  };
}
