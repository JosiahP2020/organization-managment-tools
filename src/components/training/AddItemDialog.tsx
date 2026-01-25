import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  checklistId: string;
  parentItemId?: string;
  nextSortOrder: number;
}

export function AddItemDialog({
  open,
  onOpenChange,
  sectionId,
  checklistId,
  parentItemId,
  nextSortOrder,
}: AddItemDialogProps) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("checklist_items")
        .insert({
          section_id: sectionId,
          parent_item_id: parentItemId || null,
          text,
          sort_order: nextSortOrder,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item added");
      setText("");
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Item text is required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{parentItemId ? "Add Sub-Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-text">Item Text</Label>
            <Input
              id="item-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter checklist item..."
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
