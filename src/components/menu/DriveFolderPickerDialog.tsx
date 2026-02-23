import { useState, useCallback } from "react";
import { Folder, FolderPlus, ChevronRight, Loader2, Upload, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FolderItem {
  id: string;
  name: string;
}

interface DriveFolderPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (folderId: string, folderName: string) => void;
  isExporting?: boolean;
}

export function DriveFolderPickerDialog({
  open,
  onOpenChange,
  onSelect,
  isExporting,
}: DriveFolderPickerDialogProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "My Drive" },
  ]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

  const fetchFolders = useCallback(async (parentId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("google-drive-list-folders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { parentId },
      });

      if (error) throw error;
      setFolders(data?.folders || []);
    } catch (err) {
      console.error("Failed to list folders:", err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open and when navigating
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setBreadcrumbs([{ id: "root", name: "My Drive" }]);
      fetchFolders("root");
    }
    onOpenChange(isOpen);
  };

  const navigateToFolder = (folder: FolderItem) => {
    setBreadcrumbs((prev) => [...prev, folder]);
    fetchFolders(folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    fetchFolders(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("google-drive-list-folders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { parentId: currentFolderId, action: "create", folderName: newFolderName.trim() },
      });

      if (error) throw error;
      if (data?.id) {
        setNewFolderName("");
        setShowNewFolder(false);
        fetchFolders(currentFolderId);
      }
    } catch (err) {
      console.error("Failed to create folder:", err);
    } finally {
      setCreatingFolder(false);
    }
  };

  const currentFolderName = breadcrumbs[breadcrumbs.length - 1].name;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Choose Export Location</DialogTitle>
        </DialogHeader>

        {/* Breadcrumbs + Refresh */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto pb-1">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center gap-1 shrink-0">
                {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`hover:underline ${
                    index === breadcrumbs.length - 1
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => fetchFolders(currentFolderId)}
            disabled={loading}
            title="Refresh folders"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Folder list */}
        <ScrollArea className="h-64 border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-2">
              <Folder className="h-8 w-8" />
              <p>No subfolders</p>
            </div>
          ) : (
            <div className="p-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigateToFolder(folder)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"
                >
                  <Folder className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{folder.name}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Create folder */}
        {showNewFolder ? (
          <div className="flex items-center gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setShowNewFolder(false);
              }}
            />
            <Button size="sm" onClick={handleCreateFolder} disabled={creatingFolder}>
              {creatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 text-muted-foreground"
            onClick={() => setShowNewFolder(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSelect(currentFolderId, currentFolderName)}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Export Here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
