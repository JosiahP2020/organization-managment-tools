import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistSidebar } from "@/components/training/ChecklistSidebar";
import { ChecklistSection } from "@/components/training/ChecklistSection";
import { AddSectionDialog } from "@/components/training/AddSectionDialog";
import { ChecklistPrintView } from "@/components/training/ChecklistPrintView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Image } from "lucide-react";

export interface ChecklistItem {
  id: string;
  section_id: string;
  parent_item_id: string | null;
  text: string;
  is_completed: boolean;
  sort_order: number;
  notes: string | null;
  created_at: string;
  item_type?: string;
}

export interface ChecklistSectionType {
  id: string;
  checklist_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  image_url: string | null;
  display_mode?: string;
  items: ChecklistItem[];
}

const ChecklistEditor = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { organization, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hideAllImages, setHideAllImages] = useState(false);
  const [showAllImagesGallery, setShowAllImagesGallery] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);

  // Use sub_logo_url for the checklist display
  const subLogoUrl = organization?.sub_logo_url || organization?.logo_url || null;

  // Fetch checklist
  const { data: checklist, isLoading: checklistLoading } = useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) return null;
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", checklistId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!checklistId,
  });

  // Fetch sections with items
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["checklist-sections", checklistId],
    queryFn: async () => {
      if (!checklistId) return [];
      
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("checklist_sections")
        .select("*")
        .eq("checklist_id", checklistId)
        .order("sort_order", { ascending: true });
      
      if (sectionsError) throw sectionsError;

      // Fetch all items for this checklist's sections
      const sectionIds = sectionsData.map(s => s.id);
      if (sectionIds.length === 0) return [];

      const { data: itemsData, error: itemsError } = await supabase
        .from("checklist_items")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order", { ascending: true });
      
      if (itemsError) throw itemsError;

      // Map items to their sections
      return sectionsData.map(section => ({
        ...section,
        items: itemsData.filter(item => item.section_id === section.id),
      })) as ChecklistSectionType[];
    },
    enabled: !!checklistId,
  });

  // Toggle lock mutation
  const toggleLockMutation = useMutation({
    mutationFn: async (isLocked: boolean) => {
      const { error } = await supabase
        .from("checklists")
        .update({ is_locked: isLocked })
        .eq("id", checklistId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", checklistId] });
      toast.success(checklist?.is_locked ? "Checklist unlocked" : "Checklist locked");
    },
    onError: () => {
      toast.error("Failed to update lock status");
    },
  });

  // Reset all items mutation
  const resetAllMutation = useMutation({
    mutationFn: async () => {
      if (!sections) return;
      
      const sectionIds = sections.map(s => s.id);
      const { error } = await supabase
        .from("checklist_items")
        .update({ is_completed: false })
        .in("section_id", sectionIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("All items reset");
    },
    onError: () => {
      toast.error("Failed to reset items");
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleToggleLock = () => {
    toggleLockMutation.mutate(!checklist?.is_locked);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all items? This will uncheck everything.")) {
      resetAllMutation.mutate();
    }
  };

  // Calculate total completion
  const totalItems = sections?.reduce((acc, section) => acc + section.items.length, 0) || 0;
  const completedItems = sections?.reduce((acc, section) => 
    acc + section.items.filter(item => item.is_completed).length, 0
  ) || 0;

  // Collect all sections with images for the gallery
  const sectionsWithImages = sections?.filter(section => section.image_url) || [];
  const hasAnyImages = sectionsWithImages.length > 0;

  const isLocked = checklist?.is_locked || false;
  const canEdit = isAdmin && !isLocked;

  if (checklistLoading || sectionsLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <Skeleton className="h-32 w-48" />
          </div>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!checklist) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground">Checklist not found</h1>
          <p className="text-muted-foreground mt-2">This checklist may have been deleted.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      {/* Print view - OUTSIDE DashboardLayout so no header/menu/back button */}
      <div className="hidden print:block print:p-0 print:m-0">
        <ChecklistPrintView
          ref={printRef}
          checklist={checklist}
          sections={sections || []}
          logoUrl={subLogoUrl}
          showImages={!hideAllImages}
        />
      </div>

      {/* Screen view (hidden on print) */}
      <div className="print:hidden">
        <DashboardLayout>
          <div className="max-w-6xl mx-auto">
            {/* Header: Sub-logo left, Title centered, Completion below */}
            <div className="relative flex items-start mb-8">
              {/* Sub-logo on the left */}
              <div className="flex-shrink-0">
                {subLogoUrl ? (
                  <div className="inline-flex items-center justify-center rounded-lg p-2 dark:bg-[hsl(0,0%,85%)]">
                    <img 
                      src={subLogoUrl} 
                      alt="Organization Logo" 
                      className="h-16 md:h-20 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 md:h-20 w-16 md:w-20 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Logo</span>
                  </div>
                )}
              </div>

              {/* Centered title and completion count */}
              <div className="flex-1 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {checklist.title}
                </h1>
                {checklist.description && (
                  <p className="text-muted-foreground mt-1">
                    {checklist.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {completedItems} of {totalItems} completed
                </p>
              </div>

              {/* Spacer for symmetry */}
              <div className="flex-shrink-0 w-16 md:w-20" />
            </div>

            {/* Main content with sidebar */}
            <div className="flex gap-6">
              {/* Sidebar */}
              <ChecklistSidebar
                isLocked={isLocked}
                hideCompleted={hideCompleted}
                hideAllImages={hideAllImages}
                hasAnyImages={hasAnyImages}
                onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
                onToggleHideImages={() => setHideAllImages(!hideAllImages)}
                onToggleLock={handleToggleLock}
                onReset={handleReset}
                onPrint={handlePrint}
                canEdit={isAdmin}
              />

              {/* Checklist content */}
              <div className="flex-1 space-y-4">
                {sections && sections.length > 0 ? (
                  sections.map((section, index) => (
                    <ChecklistSection
                      key={section.id}
                      section={section}
                      hideCompleted={hideCompleted}
                      canEdit={canEdit}
                      isLocked={isLocked}
                      checklistId={checklistId!}
                      isFirst={index === 0}
                      isLast={index === sections.length - 1}
                      totalSections={sections.length}
                      hideAllImages={hideAllImages}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No sections yet. {canEdit && "Add a section to get started."}
                  </div>
                )}

                {/* Add Section Button */}
                {canEdit && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setAddSectionOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Section
                  </Button>
                )}


                {/* View All Images Gallery Button */}
                {hasAnyImages && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllImagesGallery(!showAllImagesGallery)}
                      className="gap-2"
                    >
                      <Image className="h-4 w-4" />
                      {showAllImagesGallery ? "Hide Image Gallery" : "View All Images"}
                    </Button>
                  </div>
                )}

                {/* All Images Gallery */}
                {showAllImagesGallery && hasAnyImages && (
                  <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
                    <h3 className="text-lg font-semibold mb-4">All Section Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sectionsWithImages.map((section) => (
                        <div key={section.id} className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {section.title}
                          </p>
                          <img
                            src={section.image_url!}
                            alt={`${section.title} image`}
                            className="w-full rounded-lg border border-border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Section Dialog */}
          <AddSectionDialog
            open={addSectionOpen}
            onOpenChange={setAddSectionOpen}
            checklistId={checklistId!}
            nextSortOrder={sections?.length || 0}
          />
        </DashboardLayout>
      </div>
    </>
  );
};

export default ChecklistEditor;
