import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ArchiveDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  onSuccess: () => void;
}

export function ArchiveDocumentDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  onSuccess,
}: ArchiveDocumentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("training_documents")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document archived successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error archiving document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to archive document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive "{documentTitle}"? You can restore it later from the archived documents.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={isLoading}
          >
            {isLoading ? "Archiving..." : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
