import { useState } from "react";
import { Plus, FolderPlus, FileText, ClipboardList, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type ItemType = "subcategory" | "file_directory" | "checklist" | "sop_guide";

interface AddItemCardProps {
  onAdd: (type: ItemType) => void;
}

export function AddItemCard({ onAdd }: AddItemCardProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: ItemType) => {
    setOpen(false);
    onAdd(type);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/30 transition-all"
        >
          <Plus className="h-5 w-5 text-muted-foreground" />
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