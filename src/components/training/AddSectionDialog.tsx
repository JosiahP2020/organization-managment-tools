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

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string;
  nextSortOrder: number;
}

export function AddSectionDialog({
  open,
  onOpenChange,
  checklistId,
  nextSortOrder,
}: AddSectionDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("checklist_sections")
        .insert({
          checklist_id: checklistId,
          title,
          sort_order: nextSortOrder,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section added");
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to add section:", error);
      toast.error("Failed to add section");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Section title is required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter section title..."
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
              {createMutation.isPending ? "Adding..." : "Add Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
