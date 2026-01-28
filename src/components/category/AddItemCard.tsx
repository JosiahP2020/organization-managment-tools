import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderPlus, FileText, ClipboardList, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <Card 
          className="group relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/20 rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
            {/* Plus Icon */}
            <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3 group-hover:bg-accent transition-colors duration-200">
              <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            {/* Label */}
            <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
              Add Item
            </p>
          </CardContent>
        </Card>
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
