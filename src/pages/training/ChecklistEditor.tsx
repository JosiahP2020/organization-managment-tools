import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistSidebar } from "@/components/training/ChecklistSidebar";
import { ChecklistSection } from "@/components/training/ChecklistSection";
import { AddSectionDialog } from "@/components/training/AddSectionDialog";
import { ChecklistPrintView } from "@/components/training/ChecklistPrintView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface ChecklistItem {
  id: string;
  section_id: string;
  parent_item_id: string | null;
  text: string;
  is_completed: boolean;
  sort_order: number;
  notes: string | null;
  created_at: string;
}

export interface ChecklistSectionType {
  id: string;
  checklist_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  items: ChecklistItem[];
}

const ChecklistEditor = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { organization, isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [hideCompleted, setHideCompleted] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);

  const mainLogoUrl = organization?.main_logo_url || organization?.logo_url || null;

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
    <DashboardLayout>
      {/* Print view (hidden on screen) */}
      <div className="hidden print:block">
        <ChecklistPrintView
          ref={printRef}
          checklist={checklist}
          sections={sections || []}
          logoUrl={mainLogoUrl}
        />
      </div>

      {/* Screen view (hidden on print) */}
      <div className="print:hidden">
        <div className="max-w-6xl mx-auto">
          {/* Organization Logo */}
          <div className="flex justify-center mb-6 md:mb-8">
            <Logo 
              size="xl" 
              customSrc={mainLogoUrl} 
              variant="full"
              className="max-h-32 md:max-h-40"
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {checklist.title}
            </h1>
            {checklist.description && (
              <p className="text-muted-foreground mt-1">
                {checklist.description}
              </p>
            )}
          </div>

          {/* Main content with sidebar */}
          <div className="flex gap-6">
            {/* Sidebar */}
            <ChecklistSidebar
              isLocked={isLocked}
              hideCompleted={hideCompleted}
              onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
              onToggleLock={handleToggleLock}
              onReset={handleReset}
              onPrint={handlePrint}
              canEdit={isAdmin}
            />

            {/* Checklist content */}
            <div className="flex-1 space-y-4">
              {sections && sections.length > 0 ? (
                sections.map((section) => (
                  <ChecklistSection
                    key={section.id}
                    section={section}
                    hideCompleted={hideCompleted}
                    canEdit={canEdit}
                    checklistId={checklistId!}
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
                  className="w-full border-dashed gap-2"
                  onClick={() => setAddSectionOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              )}
            </div>
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
  );
};

export default ChecklistEditor;
