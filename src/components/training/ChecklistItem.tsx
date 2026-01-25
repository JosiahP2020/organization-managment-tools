import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
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
  const [showNotes, setShowNotes] = useState(!!item.notes);
  const [notes, setNotes] = useState(item.notes || "");
  const [addSubItemOpen, setAddSubItemOpen] = useState(false);
  const queryClient = useQueryClient();

  const childItems = getChildItems(item.id);
  const visibleChildren = hideCompleted
    ? childItems.filter(child => !child.is_completed)
    : childItems;

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

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      const { error } = await supabase
        .from("checklist_items")
        .update({ notes: newNotes || null })
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
    },
    onError: () => {
      toast.error("Failed to save notes");
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

  const handleNotesBlur = () => {
    if (notes !== item.notes) {
      updateNotesMutation.mutate(notes);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this item?")) {
      deleteItemMutation.mutate();
    }
  };

  return (
    <div className={cn("group", depth > 0 && "ml-6 border-l-2 border-muted pl-4")}>
      <div className="flex items-start gap-3 py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors">
        {/* Checkbox (square by default from Radix) */}
        <Checkbox
          checked={item.is_completed}
          onCheckedChange={handleToggle}
          className="mt-0.5"
          disabled={!canEdit && item.is_completed}
        />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm",
              item.is_completed && "line-through text-muted-foreground"
            )}
          >
            {item.text}
          </span>

          {/* Notes section */}
          {showNotes && (
            <div className="mt-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes..."
                className="text-sm min-h-[60px]"
                disabled={!canEdit}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowNotes(!showNotes)}
            title={showNotes ? "Hide notes" : "Show notes"}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          {canEdit && (
            <>
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

      {/* Child items (always visible, no expand/collapse) */}
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
