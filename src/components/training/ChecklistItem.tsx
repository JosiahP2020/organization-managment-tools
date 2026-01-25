import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Minus } from "lucide-react";
import { AddItemDialog } from "@/components/training/AddItemDialog";
import type { ChecklistItem as ChecklistItemType } from "@/pages/training/ChecklistEditor";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  getChildItems: (parentId: string) => ChecklistItemType[];
  hideCompleted: boolean;
  canEdit: boolean;
  checklistId: string;
  sectionId: string;
  depth: number;
}

export function ChecklistItem({
  item,
  getChildItems,
  hideCompleted,
  canEdit,
  checklistId,
  sectionId,
  depth,
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

  // Toggle completion mutation
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

  // Toggle item type mutation
  const toggleTypeMutation = useMutation({
    mutationFn: async () => {
      const newType = (item as any).item_type === "dash" ? "checkbox" : "dash";
      const { error } = await supabase
        .from("checklist_items")
        .update({ item_type: newType })
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
    },
    onError: () => {
      toast.error("Failed to toggle item type");
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
    if (!canEdit && item.is_completed) return; // Non-admins can't uncheck
    toggleCompletionMutation.mutate(!item.is_completed);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this item?")) {
      deleteItemMutation.mutate();
    }
  };

  const handleTextClick = () => {
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

  const itemType = (item as any).item_type || "checkbox";

  return (
    <div className={cn("group", depth > 0 && "ml-6 border-l-2 border-muted pl-4")}>
      <div className="flex items-start gap-3 py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors">
        {/* Checkbox or Dash */}
        {itemType === "dash" ? (
          <div className="mt-1.5 w-5 flex justify-center">
            <Minus className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <Checkbox
            checked={item.is_completed}
            onCheckedChange={handleToggle}
            className="mt-0.5"
            disabled={!canEdit && item.is_completed}
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

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => toggleTypeMutation.mutate()}
                title={itemType === "dash" ? "Switch to checkbox" : "Switch to dash"}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setAddSubItemOpen(true)}
                title="Add sub-item"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                title="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Child items (always visible) */}
      {visibleChildren.length > 0 && (
        <div className="space-y-1">
          {visibleChildren.map((child) => (
            <ChecklistItem
              key={child.id}
              item={child}
              getChildItems={getChildItems}
              hideCompleted={hideCompleted}
              canEdit={canEdit}
              checklistId={checklistId}
              sectionId={sectionId}
              depth={depth + 1}
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
