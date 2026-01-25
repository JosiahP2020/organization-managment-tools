import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DocumentCategory } from "@/pages/training/SOPTraining";

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: DocumentCategory;
  onSuccess: () => void;
}

export function CreateDocumentDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CreateDocumentDialogProps) {
  const { toast } = useToast();
  const { organization, user } = useAuth();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!organization?.id || !user?.id) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create document record
      const { error: insertError } = await supabase
        .from("training_documents")
        .insert({
          organization_id: organization.id,
          category,
          title: title.trim(),
          created_by: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Document created successfully",
      });

      // Reset and close
      setTitle("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
          <DialogDescription>
            Add a new document to this category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
