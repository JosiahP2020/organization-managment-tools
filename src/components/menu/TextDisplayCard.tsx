import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import type { MenuItem } from "@/hooks/useMenuItems";

interface TextDisplayCardProps {
  item: MenuItem;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onTitleChange: (newTitle: string) => void;
}

export function TextDisplayCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onTitleChange,
}: TextDisplayCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const subType = item.description; // "text", "address", or "lockbox"

  // Build subtitle for address/lockbox types
  const subtitle = subType === "address" ? "Address" : subType === "lockbox" ? "Lock Box Code" : null;

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== item.name) {
      onTitleChange(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
    else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="group relative flex items-center gap-3 p-3 rounded-lg bg-card border border-border transition-colors cursor-default">
        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
          <DynamicIcon name={item.icon} className="h-4 w-4 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 text-sm"
            />
          ) : (
            <>
              <h3 className="font-medium text-foreground truncate">{item.name}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Admin controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!isFirst && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp} title="Move up">
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {!isLast && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown} title="Move down">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        title="Delete Text Item"
        description={`Are you sure you want to delete this text item? This action cannot be undone.`}
      />
    </>
  );
}
