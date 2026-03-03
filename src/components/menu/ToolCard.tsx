import { useState } from "react";
import { CheckSquare, Grid3X3, ListChecks, ChevronUp, ChevronDown, Trash2, Pencil, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useLongPress } from "@/hooks/useLongPress";
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
  isSynced?: boolean;
  isSyncingToDrive?: boolean;
  onResync?: () => void;
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
  isSynced,
  isSyncingToDrive,
  onResync,
}: ToolCardProps) {
  const { isAdmin } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const { isPressed, handlers, reset, pressedRef, cardRef } = useLongPress();

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
    if (pressedRef.current) {
      return; // Don't navigate if long-press triggered
    }
    if (!isEditing && onClick) {
      onClick();
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "group relative flex items-center gap-3 p-3 rounded-xl border transition-all",
          "bg-card hover:bg-accent/50 border-border hover:border-primary/30",
          isPressed && "ring-2 ring-primary/50 bg-accent/30",
          !isEditing && onClick && "cursor-pointer"
        )}
        onClick={handleCardClick}
        {...handlers}
      >
        {/* Icon */}
        <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10 shrink-0">
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
              <h3 className="font-medium text-foreground text-sm truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{toolLabel}</p>
            </>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && !isEditing && (
          <div className={cn("flex items-center gap-0.5 transition-opacity shrink-0", isPressed ? "opacity-100" : "opacity-0 pointer-events-none [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto")}>
            {driveButton}
            {!isFirst && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 group-hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                title="Move up"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            )}
            {!isLast && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 group-hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                title="Move down"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 group-hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Edit title"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive group-hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              title="Delete tool"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Synced indicator - clickable to resync */}
        {isSynced && (
          <button
            className="shrink-0 hover:opacity-70 transition-opacity"
            title="Exported to Drive - Resync"
            onClick={(e) => {
              e.stopPropagation();
              onResync?.();
            }}
            disabled={isSyncingToDrive}
          >
            {isSyncingToDrive ? (
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            ) : (
              <CloudUpload className="h-3.5 w-3.5 text-primary" />
            )}
          </button>
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
