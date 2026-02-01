import { Plus, FolderOpen, Rows } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddMenuItemButtonProps {
  onAddSubmenu: () => void;
  onAddSection?: () => void;
  className?: string;
}

export function AddMenuItemButton({ onAddSubmenu, onAddSection, className }: AddMenuItemButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-full max-w-xs items-center justify-center",
            "rounded-lg border-2 border-dashed border-muted-foreground/30",
            "bg-transparent transition-all duration-200",
            "hover:border-primary hover:bg-primary/5",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            className
          )}
          aria-label="Add new item"
        >
          <Plus className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-popover">
        <DropdownMenuItem onClick={onAddSubmenu} className="cursor-pointer">
          <FolderOpen className="mr-2 h-4 w-4" />
          Submenu
        </DropdownMenuItem>
        {onAddSection && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAddSection} className="cursor-pointer">
              <Rows className="mr-2 h-4 w-4" />
              Section
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
