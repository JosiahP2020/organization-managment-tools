import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, CloudUpload, Loader2, FolderOpen, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { FileDirectoryView } from "./FileDirectoryView";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { cn } from "@/lib/utils";
import { useLongPress } from "@/hooks/useLongPress";

interface DriveExportContext {
  isConnected: boolean;
  getRef: (entityId: string) => { entity_id: string; last_synced_at: string; drive_file_id: string } | null;
  exportToDrive: (type: string, id: string, folderId?: string) => Promise<void>;
  isExporting: (id: string) => boolean;
  isSyncing: (id: string) => boolean;
  syncToDriveIfNeeded: (entityType: string, entityId: string, options?: { silent?: boolean }) => Promise<void>;
}

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
  onTitleChange: (newTitle: string) => void;
  isSynced?: boolean;
  isSyncingToDrive?: boolean;
  driveExport?: DriveExportContext;
  onResync?: () => void;
}

export function FileDirectoryCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onTitleChange,
  isSynced,
  isSyncingToDrive,
  driveExport,
  onResync,
}: FileDirectoryCardProps) {
  const { isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const { isPressed, handlers, reset, pressedRef, cardRef } = useLongPress();

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
      {/* Collapsed card - matches ToolCard/TextDisplayCard style */}
      <div
        ref={cardRef}
        className={cn(
          "group relative flex items-center gap-3 p-3 rounded-lg bg-card border border-border transition-all cursor-pointer hover:bg-accent/50",
          expanded && "rounded-b-none border-b-0",
          isPressed && "ring-2 ring-primary/50 bg-accent/30"
        )}
        onClick={() => {
          if (pressedRef.current) return;
          if (!isEditing) setExpanded(!expanded);
        }}
        {...handlers}
      >
        {/* Icon */}
        <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10 shrink-0">
          <FolderOpen className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
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
              <h3 className="font-medium text-foreground text-sm truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">File Directory</p>
            </>
          )}
        </div>

        {/* Admin controls */}
        {isAdmin && !isEditing && (
          <div className={cn("flex items-center gap-0.5 transition-opacity shrink-0", isPressed ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={(e) => e.stopPropagation()}>
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
            <Button variant="ghost" size="icon" className="h-6 w-6 group-hover:bg-accent" onClick={() => { setEditName(item.name); setIsEditing(true); }} title="Edit">
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
        )}

        {/* Synced indicator */}
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

        {/* Expand chevron */}
        <ChevronRight className={cn(
          "h-4 w-4 text-muted-foreground transition-transform shrink-0",
          expanded && "rotate-90"
        )} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border border-t-0 border-border rounded-b-lg p-3 bg-card">
          <FileDirectoryView
            menuItemId={item.id}
            title={item.name}
            onTitleChange={onTitleChange}
            driveExport={driveExport}
          />
        </div>
      )}

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        title="Delete File Directory"
        description={`Are you sure you want to delete "${item.name}"? All files within will be removed.`}
      />
    </>
  );
}
