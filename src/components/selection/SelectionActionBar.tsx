import { useState } from "react";
import { Copy, FolderInput, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { MoveCopyDialog } from "./MoveCopyDialog";
import { useSelectionContext } from "./SelectionProvider";
import { toast } from "sonner";

export function SelectionActionBar() {
  const { isActive, selectedIds, items, adapter, exit } = useSelectionContext();
  const [showDelete, setShowDelete] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [moveMode, setMoveMode] = useState<"move" | "copy" | null>(null);

  if (!isActive || !adapter) return null;

  const ids = Array.from(selectedIds);
  const count = ids.length;
  const singleId = count === 1 ? ids[0] : null;
  const singleMeta = singleId ? items.get(singleId) : null;

  const doDelete = async () => {
    try {
      await adapter.delete(ids);
      toast.success(count === 1 ? "Deleted" : `Deleted ${count} items`);
      exit();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    }
  };

  const startRename = () => {
    setRenameValue(singleMeta?.label ?? "");
    setShowRename(true);
  };

  const submitRename = async () => {
    if (!singleId || !adapter.rename) return;
    const v = renameValue.trim();
    if (!v) return;
    try {
      await adapter.rename(singleId, v);
      setShowRename(false);
      exit();
    } catch (e: any) {
      toast.error(e?.message || "Failed to rename");
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg animate-in slide-in-from-top duration-200">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={exit}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
            aria-label="Exit selection"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium flex-1 truncate">
            {count} selected{adapter.surfaceLabel ? ` · ${adapter.surfaceLabel}` : ""}
          </span>

          {adapter.canRename && adapter.rename && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startRename}
              disabled={count !== 1}
              className="text-primary-foreground hover:bg-primary-foreground/10 disabled:opacity-40"
            >
              <Pencil className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Rename</span>
            </Button>
          )}

          {adapter.canCopy && adapter.copy && adapter.listMoveTargets && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMoveMode("copy")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Copy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
          )}

          {adapter.canMove && adapter.move && adapter.listMoveTargets && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMoveMode("move")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <FolderInput className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Move</span>
            </Button>
          )}

          {adapter.canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDelete(true)}
              className="text-primary-foreground hover:bg-destructive/30"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Spacer pushes page content below the bar */}
      <div className="h-12" aria-hidden />

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={async () => {
          setShowDelete(false);
          await doDelete();
        }}
        title={`Delete ${count} item${count === 1 ? "" : "s"}?`}
        description={
          count === 1
            ? `"${singleMeta?.label ?? "this item"}" will be permanently deleted.`
            : `${count} items will be permanently deleted. This cannot be undone.`
        }
      />

      <Dialog open={showRename} onOpenChange={(o) => !o && setShowRename(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRename(false)}>
              Cancel
            </Button>
            <Button onClick={submitRename} disabled={!renameValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {adapter.listMoveTargets && (
        <MoveCopyDialog
          open={moveMode !== null}
          mode={moveMode ?? "move"}
          count={count}
          loadTargets={adapter.listMoveTargets}
          onCancel={() => setMoveMode(null)}
          onConfirm={async (target) => {
            try {
              if (moveMode === "move" && adapter.move) {
                await adapter.move(ids, target);
                toast.success(`Moved ${count} item${count === 1 ? "" : "s"}`);
              } else if (moveMode === "copy" && adapter.copy) {
                await adapter.copy(ids, target);
                toast.success(`Copied ${count} item${count === 1 ? "" : "s"}`);
              }
              setMoveMode(null);
              exit();
            } catch (e: any) {
              toast.error(e?.message || "Failed");
            }
          }}
        />
      )}
    </>
  );
}
