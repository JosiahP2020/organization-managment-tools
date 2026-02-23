import { useState } from "react";
import { CheckSquare, Grid3X3, ListChecks, ChevronUp, ChevronDown, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/hooks/useMenuItems";

interface ToolCardProps {
  item: MenuItem;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onTitleChange: (newTitle: string) => void;
  onClick?: () => void;
  driveButton?: React.ReactNode;
}

const toolIcons: Record<string, React.ElementType> = {
  checklist: CheckSquare,
  sop_guide: Grid3X3,
  follow_up_list: ListChecks,
};

const toolLabels: Record<string, string> = {
  checklist: "Checklist",
  sop_guide: "SOP Guide",
  follow_up_list: "Follow-up List",
};

export function ToolCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onTitleChange,
  onClick,
  driveButton,
}: ToolCardProps) {
  const { isAdmin } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);

  // Get the appropriate icon for the tool type
  const toolType = (item as any).tool_type || "checklist";
  const Icon = toolIcons[toolType] || CheckSquare;
  const toolLabel = toolLabels[toolType] || "Tool";

  const handleSave = () => {
    if (editValue.trim() && editValue !== item.name) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(item.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(item.name);
      setIsEditing(false);
    }
  };

  const handleCardClick = () => {
    if (!isEditing && onClick) {
      onClick();
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-3 p-4 rounded-xl border transition-all",
          "bg-card hover:bg-accent/50 border-border hover:border-primary/30",
          !isEditing && onClick && "cursor-pointer"
        )}
        onClick={handleCardClick}
      >
        {/* Icon */}
        <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-8 text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <h3 className="font-medium text-foreground truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{toolLabel}</p>
            </>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {driveButton}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Edit title"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {!isFirst && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {!isLast && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              title="Delete tool"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        title="Delete Tool"
        description={`Are you sure you want to delete "${item.name}"? This will also remove any linked documents.`}
      />
    </>
  );
}
