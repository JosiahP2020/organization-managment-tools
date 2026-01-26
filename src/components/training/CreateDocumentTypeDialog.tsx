import { useState } from "react";
import { CheckSquare, Grid3X3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DocumentType = "checklist" | "gemba";

interface CreateDocumentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: DocumentType) => void;
}

export function CreateDocumentTypeDialog({
  open,
  onOpenChange,
  onSelectType,
}: CreateDocumentTypeDialogProps) {
  const [hoveredType, setHoveredType] = useState<DocumentType | null>(null);

  const handleSelect = (type: DocumentType) => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Choose the type of document you want to create.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* Checklist Option */}
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md",
              hoveredType === "checklist" && "border-primary shadow-md"
            )}
            onClick={() => handleSelect("checklist")}
            onMouseEnter={() => setHoveredType("checklist")}
            onMouseLeave={() => setHoveredType(null)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                <CheckSquare className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Checklist</h3>
              <p className="text-sm text-muted-foreground">
                Interactive task lists with checkable items and nested sub-tasks.
              </p>
            </CardContent>
          </Card>

          {/* Gemba Doc Option */}
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md",
              hoveredType === "gemba" && "border-primary shadow-md"
            )}
            onClick={() => handleSelect("gemba")}
            onMouseEnter={() => setHoveredType("gemba")}
            onMouseLeave={() => setHoveredType(null)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                <Grid3X3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">SOP Guide</h3>
              <p className="text-sm text-muted-foreground">
                Visual training manuals with image grids for printing and lamination.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
