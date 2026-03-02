import { ChevronUp, ChevronDown, Trash2, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileDirectoryView } from "./FileDirectoryView";

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

  return (
    <div className="group/directory relative py-4">
      {/* Admin Controls - positioned at top right */}
      {isAdmin && (
        <div className="absolute right-0 top-4 flex items-center gap-1 opacity-0 group-hover/directory:opacity-100 transition-opacity z-10">
          {!isFirst && (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 shadow-md"
              onClick={onMoveUp}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          {!isLast && (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 shadow-md"
              onClick={onMoveDown}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 shadow-md"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isSynced && (
            <button
              className="shrink-0 ml-1 hover:opacity-70 transition-opacity"
              title="Exported to Drive - Resync"
              onClick={() => onResync?.()}
              disabled={isSyncingToDrive}
            >
              {isSyncingToDrive ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <CloudUpload className="h-4 w-4 text-primary" />
              )}
            </button>
          )}
        </div>
      )}

      {/* File Directory View - inline */}
      <FileDirectoryView 
        menuItemId={item.id} 
        title={item.name} 
        onTitleChange={onTitleChange}
        driveExport={driveExport}
      />
    </div>
  );
}
