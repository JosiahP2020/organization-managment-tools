import { useState } from "react";
import { FolderPlus, ChevronDown, ChevronRight, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DynamicIcon } from "./DynamicIcon";
import { IconPicker } from "./IconPicker";
import { MenuItemEditor } from "./MenuItemEditor";
import { useMenuCategories, MenuCategory, CreateMenuCategoryInput } from "@/hooks/useMenuCategories";
import { cn } from "@/lib/utils";

interface CategoryRowProps {
  category: MenuCategory;
  depth?: number;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
  children?: MenuCategory[];
  getChildren: (parentId: string) => MenuCategory[];
}

function CategoryRow({ category, depth = 0, onEdit, onDelete, getChildren }: CategoryRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const children = getChildren(category.id);
  const hasChildren = children.length > 0;

  return (
    <div className={cn("border-b border-border last:border-b-0", depth > 0 && "ml-6")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <DynamicIcon name={category.icon} size={18} className="text-primary shrink-0" />
            <span className="font-medium truncate">{category.name}</span>
            {category.description && (
              <span className="text-sm text-muted-foreground truncate hidden sm:inline">
                — {category.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {category.show_on_dashboard && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Dashboard</span>
            )}
            {category.show_in_sidebar && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Sidebar</span>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(category)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border bg-muted/30">
            <MenuItemEditor categoryId={category.id} />
            {children.map(child => (
              <CategoryRow
                key={child.id}
                category={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                getChildren={getChildren}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function MenuCategoryEditor() {
  const { topLevelCategories, getChildren, createCategory, updateCategory, deleteCategory, isLoading } = useMenuCategories();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MenuCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateMenuCategoryInput>({
    name: "",
    description: "",
    icon: "folder",
    show_on_dashboard: true,
    show_in_sidebar: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "folder",
      show_on_dashboard: true,
      show_in_sidebar: true,
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    await createCategory.mutateAsync(formData);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) return;
    await updateCategory.mutateAsync({
      id: editingCategory.id,
      name: formData.name,
      description: formData.description || null,
      icon: formData.icon,
      show_on_dashboard: formData.show_on_dashboard,
      show_in_sidebar: formData.show_in_sidebar,
    });
    setEditingCategory(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    await deleteCategory.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
  };

  const openEditDialog = (category: MenuCategory) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon,
      show_on_dashboard: category.show_on_dashboard,
      show_in_sidebar: category.show_in_sidebar,
    });
    setEditingCategory(category);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Menu Categories</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {topLevelCategories.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No menu categories yet. Click "Add Category" to create your first menu.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topLevelCategories.map(category => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={openEditDialog}
                  onDelete={setDeletingCategory}
                  getChildren={getChildren}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingCategory(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production Floor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker
                value={formData.icon || "folder"}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard">Show on Dashboard</Label>
              <Switch
                id="dashboard"
                checked={formData.show_on_dashboard}
                onCheckedChange={(checked) => setFormData({ ...formData, show_on_dashboard: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sidebar">Show in Sidebar</Label>
              <Switch
                id="sidebar"
                checked={formData.show_in_sidebar}
                onCheckedChange={(checked) => setFormData({ ...formData, show_in_sidebar: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingCategory(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingCategory ? handleUpdate : handleCreate}
              disabled={!formData.name.trim() || createCategory.isPending || updateCategory.isPending}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This will also delete all items within this category. This action cannot be undone.
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
    </>
  );
}
