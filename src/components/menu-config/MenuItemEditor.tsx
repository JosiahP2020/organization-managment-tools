import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, FolderTree, FileBox, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "./DynamicIcon";
import { AddMenuItemDialog } from "./AddMenuItemDialog";
import { EditMenuItemDialog } from "./EditMenuItemDialog";
import { useMenuItems, MenuItem } from "@/hooks/useMenuItems";
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
import { cn } from "@/lib/utils";

interface MenuItemEditorProps {
  categoryId: string;
}

function getItemTypeIcon(item: MenuItem) {
  switch (item.item_type) {
    case "submenu":
      return <FolderTree className="h-3 w-3" />;
    case "file_directory":
      return <FileBox className="h-3 w-3" />;
    case "tool":
      return <Wrench className="h-3 w-3" />;
    default:
      return null;
  }
}

function getItemTypeLabel(item: MenuItem) {
  switch (item.item_type) {
    case "submenu":
      return "Submenu";
    case "file_directory":
      return item.is_searchable ? "File Directory (Searchable)" : "File Directory";
    case "tool":
      const toolLabel = item.tool_type?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()) || "Tool";
      const modeLabel = item.tool_mode === "single" ? "Single" : "Unlimited";
      return `${toolLabel} (${modeLabel})`;
    default:
      return "Unknown";
  }
}

export function MenuItemEditor({ categoryId }: MenuItemEditorProps) {
  const { items, deleteItem } = useMenuItems(categoryId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const handleDelete = async () => {
    if (!deletingItem) return;
    await deleteItem.mutateAsync(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">Items in this category</span>
        <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          No items yet. Add a submenu, file directory, or tool.
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border border-border",
                "hover:bg-accent/50 transition-colors"
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
              <DynamicIcon name={item.icon} size={16} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getItemTypeIcon(item)}
                  <span>{getItemTypeLabel(item)}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingItem(item)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive" 
                onClick={() => setDeletingItem(item)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AddMenuItemDialog
        categoryId={categoryId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {editingItem && (
        <EditMenuItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
