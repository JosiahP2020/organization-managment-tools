import { Plus, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddWidgetButtonProps {
  className?: string;
}

export function AddWidgetButton({ className }: AddWidgetButtonProps) {
  const handleAddWidget = () => {
    toast.info("Widget functionality coming soon");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-16 items-center justify-center",
            "rounded-lg border-2 border-dashed border-muted-foreground/30",
            "bg-transparent transition-all duration-200",
            "hover:border-primary hover:bg-primary/5",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            className
          )}
          aria-label="Add widget"
        >
          <Plus className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-popover">
        <DropdownMenuItem onClick={handleAddWidget} className="cursor-pointer">
          <Gauge className="mr-2 h-4 w-4" />
          Widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
