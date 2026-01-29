import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddMenuCardButtonProps {
  onClick: () => void;
  className?: string;
}

export function AddMenuCardButton({ onClick, className }: AddMenuCardButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-10 w-16 items-center justify-center",
        "rounded-lg border-2 border-dashed border-muted-foreground/30",
        "bg-transparent transition-all duration-200",
        "hover:border-primary hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label="Add new menu card"
    >
      <Plus className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
    </button>
  );
}
