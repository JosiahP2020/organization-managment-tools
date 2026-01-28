import { useState } from "react";
import { Plus, LayoutList, FolderPlus, FileBox, Wrench, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/contexts/EditModeContext";

export type ItemType = "section_category" | "submenu" | "file_directory" | "tool" | "widget";

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

  const menuItems: { type: ItemType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      type: "section_category",
      label: "Section Category",
      icon: <LayoutList className="h-4 w-4 mr-2 text-primary" />,
      description: "Group items together",
    },
    {
      type: "submenu",
      label: "Submenu",
      icon: <FolderPlus className="h-4 w-4 mr-2 text-primary" />,
      description: "Create a child menu",
    },
    {
      type: "file_directory",
      label: "File Directory",
      icon: <FileBox className="h-4 w-4 mr-2 text-primary" />,
      description: "Document storage",
    },
    {
      type: "tool",
      label: "Tool",
      icon: <Wrench className="h-4 w-4 mr-2 text-primary" />,
      description: "Checklist, SOP, or Project",
    },
    {
      type: "widget",
      label: "Widget",
      icon: <LayoutDashboard className="h-4 w-4 mr-2 text-primary" />,
      description: "Embed a dashboard widget",
    },
  ];

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
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.type}
            onClick={() => handleSelect(item.type)}
            className="cursor-pointer flex flex-col items-start py-2"
          >
            <div className="flex items-center">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-6">{item.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
