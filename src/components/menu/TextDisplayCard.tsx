import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown, Pencil, CloudUpload, Loader2 } from "lucide-react";
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
  driveButton?: React.ReactNode;
  isSynced?: boolean;
  isSyncingToDrive?: boolean;
  onResync?: () => void;
}

export function TextDisplayCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onTitleChange,
  driveButton,
  isSynced,
  isSyncingToDrive,
  onResync,
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

  const isAddress = subType === "address";
  const mapsUrl = isAddress && item.name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`
    : null;

  const handleCardClick = () => {
    if (isAddress && mapsUrl && !isEditing) {
      window.open(mapsUrl, "_blank");
    }
  };

  return (
    <>
      <div
        className={`group relative flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-lg bg-card border border-border transition-colors ${isAddress ? "cursor-pointer hover:bg-accent/50" : "cursor-default"}`}
        onClick={handleCardClick}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
          <DynamicIcon name={item.icon} className="h-4 w-4 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 mr-0 sm:mr-1">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="h-7 text-sm"
            />
          ) : (
            <>
              <h3 className="font-medium text-foreground text-[11px] sm:text-sm leading-tight break-words">{item.name}</h3>
              {subtitle && (
                <p className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Admin controls */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
          {driveButton}
          {!isFirst && (
            <Button variant="ghost" size="icon" className="h-6 w-6 group-hover:bg-accent" onClick={onMoveUp} title="Move up">
              <ChevronUp className="h-3 w-3" />
            </Button>
          )}
          {!isLast && (
            <Button variant="ghost" size="icon" className="h-6 w-6 group-hover:bg-accent" onClick={onMoveDown} title="Move down">
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 group-hover:bg-accent" onClick={() => setIsEditing(true)} title="Edit">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 group-hover:bg-accent"
            onClick={() => setShowDeleteDialog(true)}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Synced indicator - clickable to resync */}
        {isSynced && (
          <button
            className="shrink-0 hover:opacity-70 transition-opacity"
            title="Exported to Drive - Resync"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
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
        title="Delete Text Item"
        description={`Are you sure you want to delete this text item? This action cannot be undone.`}
      />
    </>
  );
}
