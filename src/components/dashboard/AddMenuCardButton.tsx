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
        "group flex h-20 md:h-24 w-full items-center justify-center",
        "rounded-xl border-2 border-dashed border-muted-foreground/30",
        "bg-transparent transition-all duration-200",
        "hover:border-primary hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label="Add new menu card"
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center",
          "rounded-full border-2 border-dashed border-muted-foreground/30",
          "transition-all duration-200",
          "group-hover:border-primary group-hover:text-primary"
        )}
      >
        <Plus className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
    </button>
  );
}
