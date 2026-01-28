import { useState, useEffect, forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { IconPicker } from "@/components/menu-config/IconPicker";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  show_on_dashboard: boolean;
  show_in_sidebar: boolean;
}

interface QuickCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  category?: CategoryData;
  onSave: (data: { name: string; description?: string; icon: string; show_on_dashboard: boolean; show_in_sidebar: boolean }) => void;
  onDelete?: () => void;
}

export function QuickCategoryDialog({
  open,
  onOpenChange,
  mode,
  category,
  onSave,
  onDelete,
}: QuickCategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("folder");
  const [showOnDashboard, setShowOnDashboard] = useState(true);
  const [showInSidebar, setShowInSidebar] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when dialog opens or category changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && category) {
        setName(category.name);
        setDescription(category.description || "");
        setIcon(category.icon);
        setShowOnDashboard(category.show_on_dashboard);
        setShowInSidebar(category.show_in_sidebar);
      } else {
        setName("");
        setDescription("");
        setIcon("folder");
        setShowOnDashboard(true);
        setShowInSidebar(true);
      }
      setAdvancedOpen(false);
    }
  }, [open, mode, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      show_on_dashboard: showOnDashboard,
      show_in_sidebar: showInSidebar,
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Create a new category for your dashboard and sidebar navigation." 
                : "Edit the category name, icon, or description."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                autoFocus
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            {/* Advanced Options */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm">Advanced options</span>
                  {advancedOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDashboard" className="cursor-pointer">
                    Show on Dashboard
                  </Label>
                  <Switch
                    id="showDashboard"
                    checked={showOnDashboard}
                    onCheckedChange={setShowOnDashboard}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showSidebar" className="cursor-pointer">
                    Show in Sidebar
                  </Label>
                  <Switch
                    id="showSidebar"
                    checked={showInSidebar}
                    onCheckedChange={setShowInSidebar}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{category?.name}"? This will also delete all items within this category. This action cannot be undone.
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
    </>
  );
}
