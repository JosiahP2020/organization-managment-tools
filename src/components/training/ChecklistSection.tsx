import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Plus, Trash2, Upload, MessageSquare } from "lucide-react";
import { ChecklistItem } from "@/components/training/ChecklistItem";
import { AddItemDialog } from "@/components/training/AddItemDialog";
import type { ChecklistSectionType, ChecklistItem as ChecklistItemType } from "@/pages/training/ChecklistEditor";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  hideCompleted: boolean;
  canEdit: boolean;
  isLocked: boolean;
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
  isLocked,
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Get display mode from section (with fallback to checkbox)
  const displayMode = ((section as any).display_mode || "checkbox") as "checkbox" | "numbered";

  // Get images array (with fallback to empty array, also handle legacy image_url)
  const getImages = (): string[] => {
    const imagesFromArray = (section as any).images as string[] | null;
    if (imagesFromArray && Array.isArray(imagesFromArray) && imagesFromArray.length > 0) {
      return imagesFromArray.filter(Boolean);
    }
    // Fallback to legacy image_url
    if (section.image_url) {
      return [section.image_url];
    }
    return [];
  };

  const images = getImages();

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  // Update section title mutation
  const updateTitleMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const { error } = await supabase
        .from("checklist_sections")
        .update({ title: newTitle })
        .eq("id", section.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      setIsEditingTitle(false);
    },
    onError: () => {
      toast.error("Failed to update section title");
      setEditedTitle(section.title);
      setIsEditingTitle(false);
    },
  });

  // Toggle display mode mutation (per section)
  const toggleDisplayModeMutation = useMutation({
    mutationFn: async () => {
      const newMode = displayMode === "numbered" ? "checkbox" : "numbered";
      const { error } = await supabase
        .from("checklist_sections")
        .update({ display_mode: newMode })
        .eq("id", section.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
    },
    onError: () => {
      toast.error("Failed to update display mode");
    },
  });

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

  // Image upload mutation - now supports multiple images
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

      // Add new image to the images array
      const updatedImages = [...images, publicUrl.publicUrl];

      const { error: updateError } = await supabase
        .from("checklist_sections")
        .update({ 
          images: updatedImages,
          image_url: updatedImages[0] // Keep legacy field in sync
        })
        .eq("id", section.id);

      if (updateError) throw updateError;

      return publicUrl.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("Image uploaded");
      setUploading(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setUploading(false);
    },
  });

  // Remove specific image mutation
  const removeImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const updatedImages = images.filter(img => img !== imageUrl);

      const { error } = await supabase
        .from("checklist_sections")
        .update({ 
          images: updatedImages,
          image_url: updatedImages.length > 0 ? updatedImages[0] : null // Keep legacy field in sync
        })
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
    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTitleClick = () => {
    // Only allow title editing if canEdit (admin and not locked)
    if (canEdit) {
      setEditedTitle(section.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== section.title) {
      updateTitleMutation.mutate(trimmedTitle);
    } else {
      setEditedTitle(section.title);
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditedTitle(section.title);
      setIsEditingTitle(false);
    }
  };

  const completedCount = section.items.filter(i => i.is_completed).length;
  const totalCount = section.items.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          {/* Section title - clickable to edit */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-xl md:text-2xl font-bold h-auto py-1 px-2 max-w-full"
              />
            ) : (
              <h3
                onClick={handleTitleClick}
                className={`text-xl md:text-2xl font-bold ${canEdit ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                title={canEdit ? "Click to edit" : undefined}
              >
                {section.title}
              </h3>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Progress count */}
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>

            {/* Reorder arrows - only when canEdit */}
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
            
            {/* Delete button - only when canEdit */}
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
            {visibleItems.map((item, index) => (
              <ChecklistItem
                key={item.id}
                item={item}
                getChildItems={getChildItems}
                hideCompleted={hideCompleted}
                canEdit={canEdit}
                isLocked={isLocked}
                checklistId={checklistId}
                sectionId={section.id}
                depth={0}
                displayMode={displayMode}
                itemNumber={index + 1}
                onToggleDisplayMode={() => toggleDisplayModeMutation.mutate()}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            {hideCompleted ? "All items completed" : "No items in this section"}
          </p>
        )}

        {/* Add Item Button - only when canEdit */}
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground mt-2"
            onClick={() => setAddItemOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}

        {/* Section Images - multiple images with hover delete */}
        {!hideAllImages && images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((imageUrl, index) => (
              <div 
                key={index} 
                className="relative group inline-block"
              >
                <img 
                  src={imageUrl} 
                  alt={`${section.title} image ${index + 1}`}
                  className="max-h-48 rounded-lg border border-border"
                />
                {/* Delete button - visible on hover (desktop) or always visible (mobile) */}
                {canEdit && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className={`absolute top-2 right-2 h-8 w-8 transition-opacity ${
                      isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={() => removeImageMutation.mutate(imageUrl)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
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

        {/* Bottom action bar - Notes always visible, Add Image always available when canEdit */}
        <div className="mt-4 border-t border-border pt-4 flex items-center gap-2">
          {/* Show Notes button - always available */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            {showNotes ? "Hide Notes" : "Show Notes"}
          </Button>

          {/* Add Image button - always available when canEdit (supports multiple images) */}
          {canEdit && (
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
          
        {/* Notes textarea - always visible when toggled, but readonly when locked */}
        {showNotes && (
          <div className="mt-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add section notes..."
              className="text-sm min-h-[80px]"
              disabled={!canEdit}
              readOnly={isLocked && !canEdit}
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
