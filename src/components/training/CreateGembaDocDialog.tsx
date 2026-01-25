import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface CreateGembaDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "machine_operation" | "machine_maintenance" | "sop_training";
  onSuccess: (gembaDocId: string) => void;
}

export function CreateGembaDocDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CreateGembaDocDialogProps) {
  const { organization, user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id || !user?.id) throw new Error("Not authenticated");

      // Create the gemba doc
      const { data: gembaDoc, error: docError } = await supabase
        .from("gemba_docs")
        .insert({
          organization_id: organization.id,
          category,
          title: title.trim(),
          description: description.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create the first page
      const { error: pageError } = await supabase
        .from("gemba_doc_pages")
        .insert({
          gemba_doc_id: gembaDoc.id,
          page_number: 1,
        });

      if (pageError) throw pageError;

      return gembaDoc;
    },
    onSuccess: (data) => {
      toast({ title: "Gemba Doc created successfully" });
      setTitle("");
      setDescription("");
      onOpenChange(false);
      onSuccess(data.id);
    },
    onError: (error) => {
      toast({
        title: "Failed to create Gemba Doc",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Gemba Doc</DialogTitle>
          <DialogDescription>
            Create a new visual training manual with customizable image grids.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gemba-title">Title</Label>
              <Input
                id="gemba-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Machine Setup Guide"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gemba-description">Description (optional)</Label>
              <Textarea
                id="gemba-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this document"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
