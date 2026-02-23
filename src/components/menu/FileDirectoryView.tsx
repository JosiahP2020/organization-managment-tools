import { useState, useRef, useMemo } from "react";
import { Search, Upload, FileText, Image, FileVideo, FileAudio, File, Trash2, Download, Filter, X, ChevronDown, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFileDirectory, FileDirectoryFile } from "@/hooks/useFileDirectory";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ExportToDriveButton } from "./ExportToDriveButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DriveExportContext {
  isConnected: boolean;
  getRef: (entityId: string) => { entity_id: string; last_synced_at: string; drive_file_id: string } | null;
  exportToDrive: (type: string, id: string, folderId?: string) => Promise<void>;
  isExporting: (id: string) => boolean;
}

interface FileDirectoryViewProps {
  menuItemId: string;
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  driveExport?: DriveExportContext;
}

type FileTypeFilter = "all" | "documents" | "images" | "videos" | "audio" | "other";
type SortOption = "newest" | "oldest" | "name" | "size";

const FILE_TYPE_CATEGORIES: Record<FileTypeFilter, string[]> = {
  all: [],
  documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  videos: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
  other: [],
};

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return FileVideo;
  if (fileType.startsWith("audio/")) return FileAudio;
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("text")) return FileText;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function matchesFileType(fileType: string | null, filter: FileTypeFilter): boolean {
  if (filter === "all") return true;
  if (!fileType) return filter === "other";
  
  const types = FILE_TYPE_CATEGORIES[filter];
  if (filter === "other") {
    return !Object.entries(FILE_TYPE_CATEGORIES)
      .filter(([key]) => key !== "all" && key !== "other")
      .some(([, types]) => types.some(t => fileType.includes(t) || fileType.startsWith(t.split("/")[0])));
  }
  
  return types.some(t => fileType.includes(t) || fileType.startsWith(t.split("/")[0]));
}

export function FileDirectoryView({ menuItemId, title, onTitleChange, driveExport }: FileDirectoryViewProps) {
  const { isAdmin } = useAuth();
  const { files, isLoading, uploadFile, deleteFile } = useFileDirectory(menuItemId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileDirectoryFile | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || "");

  const handleTitleSave = () => {
    if (editedTitle.trim() && onTitleChange) {
      onTitleChange(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditedTitle(title || "");
      setIsEditingTitle(false);
    }
  };

  const startEditingTitle = () => {
    setEditedTitle(title || "");
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    for (const file of Array.from(selectedFiles)) {
      await uploadFile.mutateAsync(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteClick = (file: FileDirectoryFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (fileToDelete) {
      await deleteFile.mutateAsync(fileToDelete.id);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleDownload = (file: FileDirectoryFile) => {
    window.open(file.file_url, "_blank");
  };

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => f.file_name.toLowerCase().includes(query));
    }

    if (typeFilter !== "all") {
      result = result.filter(f => matchesFileType(f.file_type, typeFilter));
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name":
        result.sort((a, b) => a.file_name.localeCompare(b.file_name));
        break;
      case "size":
        result.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
        break;
    }

    return result;
  }, [files, searchQuery, typeFilter, sortBy]);

  const hasActiveFilters = searchQuery || typeFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Header with editable title */}
      {title && (
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                ref={titleInputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSave}
                className="text-lg font-semibold h-9 max-w-xs"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleTitleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="group/title flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {isAdmin && onTitleChange && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover/title:opacity-100 transition-opacity"
                  onClick={startEditingTitle}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search and Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex gap-2">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {typeFilter === "all" ? "All Types" : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked={typeFilter === "all"} onCheckedChange={() => setTypeFilter("all")}>All Types</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={typeFilter === "documents"} onCheckedChange={() => setTypeFilter("documents")}>Documents</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={typeFilter === "images"} onCheckedChange={() => setTypeFilter("images")}>Images</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={typeFilter === "videos"} onCheckedChange={() => setTypeFilter("videos")}>Videos</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={typeFilter === "audio"} onCheckedChange={() => setTypeFilter("audio")}>Audio</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={typeFilter === "other"} onCheckedChange={() => setTypeFilter("other")}>Other</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span className="hidden sm:inline">Sort:</span>
                <span className="capitalize">{sortBy}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>Name A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("size")}>Size (Largest)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upload Button - Admin Only */}
          {isAdmin && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadFile.isPending}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {uploadFile.isPending ? "Uploading..." : "Upload"}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredFiles.length} of {files.length} files
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
            }}
            className="h-auto py-1 px-2 text-xs"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Files Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <File className="h-10 w-10 opacity-50" />
            <p className="font-medium">
              {hasActiveFilters ? "No files match your filters" : "No files yet"}
            </p>
            {isAdmin && !hasActiveFilters && (
              <p className="text-sm">Click the Upload button to add files</p>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.file_type);
            const fileRef = driveExport?.isConnected ? driveExport.getRef(file.id) : null;
            return (
              <Card
                key={file.id}
                className={cn(
                  "group relative p-3 transition-all hover:shadow-md",
                  "border border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={file.file_name}>
                      {file.file_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isAdmin && driveExport?.isConnected && (
                    <ExportToDriveButton
                      entityId={file.id}
                      entityType="file"
                      isExporting={driveExport.isExporting(file.id)}
                      lastSynced={fileRef?.last_synced_at || null}
                      onExport={(folderId) => driveExport.exportToDrive("file", file.id, folderId)}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 group-hover:bg-accent"
                    onClick={() => handleDownload(file)}
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive group-hover:bg-accent"
                      onClick={() => handleDeleteClick(file)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
