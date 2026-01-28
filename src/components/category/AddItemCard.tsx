import { useState } from "react";
import { Plus, FolderPlus, FileText, ClipboardList, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/contexts/EditModeContext";

export type ItemType = "subcategory" | "file_directory" | "checklist" | "sop_guide";

interface AddItemCardProps {
  onAdd: (type: ItemType) => void;
}

export function AddItemCard({ onAdd }: AddItemCardProps) {
  const [open, setOpen] = useState(false);
  const { isEditMode } = useEditMode();

  // Only show in edit mode
  if (!isEditMode) return null;

  const handleSelect = (type: ItemType) => {
    setOpen(false);
    onAdd(type);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/20 transition-all"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Add Item</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem onClick={() => handleSelect("subcategory")} className="cursor-pointer">
          <FolderPlus className="h-4 w-4 mr-2 text-primary" />
          Subcategory
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("file_directory")} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-primary" />
          File Directory
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("checklist")} className="cursor-pointer">
          <ClipboardList className="h-4 w-4 mr-2 text-primary" />
          Checklist
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("sop_guide")} className="cursor-pointer">
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          SOP Guide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}