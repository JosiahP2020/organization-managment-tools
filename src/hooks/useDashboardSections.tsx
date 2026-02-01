import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DashboardCategory } from "./useDashboardCategories";

export interface DashboardSection {
  id: string;
  title: string;
  sort_order: number;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  categories: DashboardCategory[];
}

export function useDashboardSections() {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sections with their categories
  const { data: sections = [], isLoading, error } = useQuery({
    queryKey: ["dashboard-sections", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      // Fetch all sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("dashboard_sections")
        .select("*")
        .eq("organization_id", organization.id)
        .order("sort_order", { ascending: true });

      if (sectionsError) throw sectionsError;

      // Fetch all categories that show on dashboard
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("show_on_dashboard", true)
        .is("parent_category_id", null)
        .order("sort_order", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Group categories by section_id
      const categoriesBySection = new Map<string | null, DashboardCategory[]>();
      
      for (const category of categoriesData || []) {
        const sectionId = category.section_id;
        if (!categoriesBySection.has(sectionId)) {
          categoriesBySection.set(sectionId, []);
        }
        categoriesBySection.get(sectionId)!.push(category as DashboardCategory);
      }

      // Build sections with their categories
      const result: DashboardSection[] = [];

      // First, add a "default" section for categories without a section_id
      const unsortedCategories = categoriesBySection.get(null) || [];
      if (unsortedCategories.length > 0 || sectionsData?.length === 0) {
        result.push({
          id: "default",
          title: "Main Menu",
          sort_order: -1, // Always first
          organization_id: organization.id,
          created_by: user?.id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          categories: unsortedCategories,
        });
      }

      // Then add actual sections from the database
      for (const section of sectionsData || []) {
        result.push({
          ...section,
          categories: categoriesBySection.get(section.id) || [],
        });
      }

      return result;
    },
    enabled: !!organization?.id,
  });

  // Create a new section
  const createSection = useMutation({
    mutationFn: async (title: string) => {
      if (!organization?.id || !user?.id) throw new Error("Not authenticated");

      // Get the max sort_order
      const maxSortOrder = sections.reduce((max, s) => 
        s.id !== "default" ? Math.max(max, s.sort_order) : max, -1
      );

      const { data, error } = await supabase
        .from("dashboard_sections")
        .insert({
          title,
          organization_id: organization.id,
          created_by: user.id,
          sort_order: maxSortOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      toast.success("Section created");
    },
    onError: (error) => {
      console.error("Failed to create section:", error);
      toast.error("Failed to create section");
    },
  });

  // Update section title
  const updateSectionTitle = useMutation({
    mutationFn: async ({ sectionId, title }: { sectionId: string; title: string }) => {
      if (sectionId === "default") {
        // For default section, we don't save to DB - it's local only
        return { id: "default", title };
      }

      const { data, error } = await supabase
        .from("dashboard_sections")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", sectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    },
    onError: (error) => {
      console.error("Failed to update section:", error);
      toast.error("Failed to update section title");
    },
  });

  // Delete a section
  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      if (sectionId === "default") {
        throw new Error("Cannot delete default section");
      }

      // First, unlink all categories from this section
      const { error: unlinkError } = await supabase
        .from("menu_categories")
        .update({ section_id: null })
        .eq("section_id", sectionId);

      if (unlinkError) throw unlinkError;

      // Then delete the section
      const { error } = await supabase
        .from("dashboard_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      toast.success("Section deleted");
    },
    onError: (error) => {
      console.error("Failed to delete section:", error);
      toast.error("Failed to delete section");
    },
  });

  // Move section up
  const moveSectionUp = useMutation({
    mutationFn: async (sectionId: string) => {
      const realSections = sections.filter(s => s.id !== "default");
      const currentIndex = realSections.findIndex(s => s.id === sectionId);
      
      if (currentIndex <= 0) return;
      
      const prevSection = realSections[currentIndex - 1];
      const currentSection = realSections[currentIndex];
      
      await supabase
        .from("dashboard_sections")
        .update({ sort_order: prevSection.sort_order })
        .eq("id", sectionId);
        
      await supabase
        .from("dashboard_sections")
        .update({ sort_order: currentSection.sort_order })
        .eq("id", prevSection.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    },
    onError: (error) => {
      console.error("Failed to move section:", error);
      toast.error("Failed to move section");
    },
  });

  // Move section down
  const moveSectionDown = useMutation({
    mutationFn: async (sectionId: string) => {
      const realSections = sections.filter(s => s.id !== "default");
      const currentIndex = realSections.findIndex(s => s.id === sectionId);
      
      if (currentIndex === -1 || currentIndex >= realSections.length - 1) return;
      
      const nextSection = realSections[currentIndex + 1];
      const currentSection = realSections[currentIndex];
      
      await supabase
        .from("dashboard_sections")
        .update({ sort_order: nextSection.sort_order })
        .eq("id", sectionId);
        
      await supabase
        .from("dashboard_sections")
        .update({ sort_order: currentSection.sort_order })
        .eq("id", nextSection.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    },
    onError: (error) => {
      console.error("Failed to move section:", error);
      toast.error("Failed to move section");
    },
  });

  // Move category up within section
  const moveCategoryUp = useMutation({
    mutationFn: async ({ categoryId, sectionId }: { categoryId: string; sectionId: string }) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const currentIndex = section.categories.findIndex(c => c.id === categoryId);
      if (currentIndex <= 0) return;
      
      const prevCategory = section.categories[currentIndex - 1];
      const currentCategory = section.categories[currentIndex];
      
      await supabase
        .from("menu_categories")
        .update({ sort_order: prevCategory.sort_order })
        .eq("id", categoryId);
        
      await supabase
        .from("menu_categories")
        .update({ sort_order: currentCategory.sort_order })
        .eq("id", prevCategory.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    },
    onError: (error) => {
      console.error("Failed to move category:", error);
      toast.error("Failed to move menu card");
    },
  });

  // Move category down within section
  const moveCategoryDown = useMutation({
    mutationFn: async ({ categoryId, sectionId }: { categoryId: string; sectionId: string }) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const currentIndex = section.categories.findIndex(c => c.id === categoryId);
      if (currentIndex === -1 || currentIndex >= section.categories.length - 1) return;
      
      const nextCategory = section.categories[currentIndex + 1];
      const currentCategory = section.categories[currentIndex];
      
      await supabase
        .from("menu_categories")
        .update({ sort_order: nextCategory.sort_order })
        .eq("id", categoryId);
        
      await supabase
        .from("menu_categories")
        .update({ sort_order: currentCategory.sort_order })
        .eq("id", nextCategory.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    },
    onError: (error) => {
      console.error("Failed to move category:", error);
      toast.error("Failed to move menu card");
    },
  });

  // Delete a category
  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from("menu_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      toast.success("Menu card deleted");
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete menu card");
    },
  });

  // Reorder categories within a section
  const reorderCategories = useMutation({
    mutationFn: async ({ sectionId, categoryIds }: { sectionId: string; categoryIds: string[] }) => {
      for (let i = 0; i < categoryIds.length; i++) {
        const { error } = await supabase
          .from("menu_categories")
          .update({ sort_order: i })
          .eq("id", categoryIds[i]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
    },
    onError: (error) => {
      console.error("Failed to reorder categories:", error);
      toast.error("Failed to reorder menu cards");
    },
  });

  // Move a category to a different section
  const moveCategory = useMutation({
    mutationFn: async ({ 
      categoryId, 
      targetSectionId, 
      newSortOrder 
    }: { 
      categoryId: string; 
      targetSectionId: string | null; 
      newSortOrder: number;
    }) => {
      const { error } = await supabase
        .from("menu_categories")
        .update({ 
          section_id: targetSectionId === "default" ? null : targetSectionId,
          sort_order: newSortOrder,
        })
        .eq("id", categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-sections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      toast.success("Menu card moved");
    },
    onError: (error) => {
      console.error("Failed to move category:", error);
      toast.error("Failed to move menu card");
    },
  });

  return {
    sections,
    isLoading,
    error,
    createSection,
    updateSectionTitle,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
    deleteCategory,
    reorderCategories,
    moveCategory,
    moveCategoryUp,
    moveCategoryDown,
  };
}
