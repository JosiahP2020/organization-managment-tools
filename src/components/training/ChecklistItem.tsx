import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Hash } from "lucide-react";
import { AddItemDialog } from "@/components/training/AddItemDialog";
import type { ChecklistItem as ChecklistItemType } from "@/pages/training/ChecklistEditor";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  getChildItems: (parentId: string) => ChecklistItemType[];
  hideCompleted: boolean;
  canEdit: boolean;
  isLocked: boolean;
  checklistId: string;
  sectionId: string;
  depth: number;
  displayMode: "checkbox" | "numbered";
  itemNumber: number;
  parentLetter?: string;
  onToggleDisplayMode?: () => void;
}

// Helper to convert number to letter (1 -> A, 2 -> B, etc.)
const numberToLetter = (num: number): string => {
  return String.fromCharCode(64 + num);
};

export function ChecklistItem({
  item,
  getChildItems,
  hideCompleted,
  canEdit,
  isLocked,
  checklistId,
  sectionId,
  depth,
  displayMode,
  itemNumber,
  parentLetter,
  onToggleDisplayMode,
}: ChecklistItemProps) {
  const [addSubItemOpen, setAddSubItemOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const childItems = getChildItems(item.id);
  const visibleChildren = hideCompleted
    ? childItems.filter(child => !child.is_completed)
    : childItems;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Toggle completion mutation - always allowed (even when locked)
  const toggleCompletionMutation = useMutation({
    mutationFn: async (isCompleted: boolean) => {
      const { error } = await supabase
        .from("checklist_items")
        .update({ is_completed: isCompleted })
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
    },
    onError: () => {
      toast.error("Failed to update item");
    },
  });

  // Update item text mutation
  const updateTextMutation = useMutation({
    mutationFn: async (newText: string) => {
      const { error } = await supabase
        .from("checklist_items")
        .update({ text: newText })
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update item");
      setEditedText(item.text);
      setIsEditing(false);
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("checklist_items")
        .delete()
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("Item deleted");
    },
    onError: () => {
      toast.error("Failed to delete item");
    },
  });

  const handleToggle = () => {
    // Toggle is always allowed - checking/unchecking items works even when locked
    toggleCompletionMutation.mutate(!item.is_completed);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this item?")) {
      deleteItemMutation.mutate();
    }
  };

  const handleTextClick = () => {
    // Only allow text editing if canEdit (admin and not locked)
    if (canEdit) {
      setEditedText(item.text);
      setIsEditing(true);
    }
  };

  const handleTextSave = () => {
    const trimmedText = editedText.trim();
    if (trimmedText && trimmedText !== item.text) {
      updateTextMutation.mutate(trimmedText);
    } else {
      setEditedText(item.text);
      setIsEditing(false);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTextSave();
    } else if (e.key === "Escape") {
      setEditedText(item.text);
      setIsEditing(false);
    }
  };

  // Determine what to display in place of checkbox
  const getDisplayPrefix = () => {
    if (displayMode === "numbered") {
      if (depth === 0) {
        return `${itemNumber}.`;
      } else {
        return `${numberToLetter(itemNumber)}.`;
      }
    }
    return null;
  };

  const displayPrefix = getDisplayPrefix();

  return (
    <div className={cn("group", depth > 0 && "ml-6 border-l-2 border-muted pl-4")}>
      <div className="flex items-start gap-3 py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors">
        {/* Checkbox or Number */}
        {displayMode === "numbered" ? (
          <div className="mt-0.5 w-5 flex justify-center">
            <span className="text-sm font-medium text-muted-foreground">{displayPrefix}</span>
          </div>
        ) : (
          <Checkbox
            checked={item.is_completed}
            onCheckedChange={handleToggle}
            className="mt-0.5"
          />
        )}

        {/* Text - clickable to edit */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onBlur={handleTextSave}
              onKeyDown={handleTextKeyDown}
              className="text-sm h-auto py-1 px-2"
            />
          ) : (
            <span
              onClick={handleTextClick}
              className={cn(
                "text-sm",
                item.is_completed && "line-through text-muted-foreground",
                canEdit && "cursor-pointer hover:text-primary transition-colors"
              )}
              title={canEdit ? "Click to edit" : undefined}
            >
              {item.text}
            </span>
          )}
        </div>

        {/* Actions - only show when canEdit (admin and not locked) */}
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAddSubItemOpen(true)}
              title="Add sub-item"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {/* Toggle display mode button (# symbol) - only on top-level items */}
            {depth === 0 && onToggleDisplayMode && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${displayMode === "numbered" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                onClick={onToggleDisplayMode}
                title={displayMode === "numbered" ? "Switch to checkboxes" : "Switch to numbered list"}
              >
                <Hash className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Child items (always visible) */}
      {visibleChildren.length > 0 && (
        <div className="space-y-1">
          {visibleChildren.map((child, index) => (
            <ChecklistItem
              key={child.id}
              item={child}
              getChildItems={getChildItems}
              hideCompleted={hideCompleted}
              canEdit={canEdit}
              isLocked={isLocked}
              checklistId={checklistId}
              sectionId={sectionId}
              depth={depth + 1}
              displayMode={displayMode}
              itemNumber={index + 1}
            />
          ))}
        </div>
      )}

      {/* Add Sub-Item Dialog */}
      <AddItemDialog
        open={addSubItemOpen}
        onOpenChange={setAddSubItemOpen}
        sectionId={sectionId}
        checklistId={checklistId}
        parentItemId={item.id}
        nextSortOrder={childItems.length}
      />
    </div>
  );
}
