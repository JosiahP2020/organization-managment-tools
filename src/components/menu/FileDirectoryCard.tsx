import { useState } from "react";
import { FolderOpen, ChevronUp, ChevronDown, Trash2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { FileDirectoryView } from "./FileDirectoryView";

interface FileDirectoryCardProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
  };
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function FileDirectoryCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: FileDirectoryCardProps) {
  const { isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <Card
        className={cn(
          "group relative p-4 transition-all cursor-pointer",
          "hover:shadow-md hover:border-primary/30",
          isExpanded && "border-primary/50 shadow-md"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
            <DynamicIcon name={item.icon || "folder-open"} className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{item.name}</h4>
            {item.description && (
              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            )}
          </div>
          <ChevronRight
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div 
            className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveDown}
              disabled={isLast}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Expanded File Directory View */}
      {isExpanded && (
        <div className="pl-4 border-l-2 border-primary/30 ml-6">
          <FileDirectoryView menuItemId={item.id} />
        </div>
      )}
    </div>
  );
}
