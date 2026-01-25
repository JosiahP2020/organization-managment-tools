import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, Plus, Trash2, Upload, X, MessageSquare } from "lucide-react";
import { ChecklistItem } from "@/components/training/ChecklistItem";
import { AddItemDialog } from "@/components/training/AddItemDialog";
import type { ChecklistSectionType, ChecklistItem as ChecklistItemType } from "@/pages/training/ChecklistEditor";

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  hideCompleted: boolean;
  canEdit: boolean;
  checklistId: string;
  isFirst: boolean;
  isLast: boolean;
  totalSections: number;
  hideAllImages: boolean;
}

export function ChecklistSection({
  section,
  hideCompleted,
  canEdit,
  checklistId,
  isFirst,
  isLast,
  totalSections,
  hideAllImages,
}: ChecklistSectionProps) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Build a tree of items (top-level items with their children)
  const buildItemTree = (items: ChecklistItemType[]): ChecklistItemType[] => {
    const topLevelItems = items.filter(item => !item.parent_item_id);
    return topLevelItems;
  };

  const getChildItems = (parentId: string): ChecklistItemType[] => {
    return section.items.filter(item => item.parent_item_id === parentId);
  };

  const topLevelItems = buildItemTree(section.items);

  // Filter items if hideCompleted is true
  const visibleItems = hideCompleted
    ? topLevelItems.filter(item => !item.is_completed)
    : topLevelItems;

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("checklist_sections")
        .delete()
        .eq("id", section.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("Section deleted");
    },
    onError: () => {
      toast.error("Failed to delete section");
    },
  });

  // Reorder section mutation
  const reorderSectionMutation = useMutation({
    mutationFn: async (direction: "up" | "down") => {
      // Get current sections
      const { data: allSections, error: fetchError } = await supabase
        .from("checklist_sections")
        .select("id, sort_order")
        .eq("checklist_id", checklistId)
        .order("sort_order", { ascending: true });

      if (fetchError) throw fetchError;

      const currentIndex = allSections.findIndex(s => s.id === section.id);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= allSections.length) return;

      const currentSection = allSections[currentIndex];
      const targetSection = allSections[targetIndex];

      // Swap sort_order values
      const { error: updateError1 } = await supabase
        .from("checklist_sections")
        .update({ sort_order: targetSection.sort_order })
        .eq("id", currentSection.id);

      if (updateError1) throw updateError1;

      const { error: updateError2 } = await supabase
        .from("checklist_sections")
        .update({ sort_order: currentSection.sort_order })
        .eq("id", targetSection.id);

      if (updateError2) throw updateError2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
    },
    onError: () => {
      toast.error("Failed to reorder section");
    },
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `section-${section.id}-${Date.now()}.${fileExt}`;
      const filePath = `checklist-sections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("training-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("training-documents")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("checklist_sections")
        .update({ image_url: publicUrl.publicUrl })
        .eq("id", section.id);

      if (updateError) throw updateError;

      return publicUrl.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("Image uploaded");
      setUploading(false);
    },
    onError: () => {
      toast.error("Failed to upload image");
      setUploading(false);
    },
  });

  // Remove image mutation
  const removeImageMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("checklist_sections")
        .update({ image_url: null })
        .eq("id", section.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("Image removed");
    },
    onError: () => {
      toast.error("Failed to remove image");
    },
  });

  const handleDeleteSection = () => {
    if (window.confirm(`Are you sure you want to delete "${section.title}"? All items in this section will be deleted.`)) {
      deleteSectionMutation.mutate();
    }
  };

  const handleMoveUp = () => {
    reorderSectionMutation.mutate("up");
  };

  const handleMoveDown = () => {
    reorderSectionMutation.mutate("down");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const completedCount = section.items.filter(i => i.is_completed).length;
  const totalCount = section.items.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* Section title - bigger */}
          <CardTitle className="text-xl md:text-2xl font-bold">{section.title}</CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Progress count */}
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>

            {/* Reorder arrows */}
            {canEdit && totalSections > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleMoveUp}
                  disabled={isFirst}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleMoveDown}
                  disabled={isLast}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Delete button */}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDeleteSection}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Items */}
        {visibleItems.length > 0 ? (
          <div className="space-y-1">
            {visibleItems.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                getChildItems={getChildItems}
                hideCompleted={hideCompleted}
                canEdit={canEdit}
                checklistId={checklistId}
                sectionId={section.id}
                depth={0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            {hideCompleted ? "All items completed" : "No items in this section"}
          </p>
        )}

        {/* Add Item Button */}
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setAddItemOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}

        {/* Section Image - at bottom */}
        {!hideAllImages && section.image_url && (
          <div className="relative mt-4 inline-block">
            <img 
              src={section.image_url} 
              alt={`${section.title} image`}
              className="max-h-48 rounded-lg border border-border"
            />
            {canEdit && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => removeImageMutation.mutate()}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Bottom action bar - Notes and Add Image buttons side by side */}
        <div className="mt-4 border-t border-border pt-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            {showNotes ? "Hide Notes" : "Show Notes"}
          </Button>

          {canEdit && !section.image_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Add Image"}
            </Button>
          )}
        </div>
          
        {showNotes && (
          <div className="mt-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add section notes..."
              className="text-sm min-h-[80px]"
              disabled={!canEdit}
            />
          </div>
        )}
      </CardContent>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        sectionId={section.id}
        checklistId={checklistId}
        nextSortOrder={section.items.length}
      />
    </Card>
  );
}
