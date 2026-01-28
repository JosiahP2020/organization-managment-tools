import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "./IconPicker";
import { useMenuItems, MenuItem, UpdateMenuItemInput } from "@/hooks/useMenuItems";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { cn } from "@/lib/utils";

interface EditMenuItemDialogProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ToolType = "checklist" | "sop_guide" | "project_hub";
type ToolMode = "unlimited" | "single";

const TOOL_TYPES = [
  { value: "checklist" as const, label: "Checklist" },
  { value: "sop_guide" as const, label: "SOP Guide" },
  { value: "project_hub" as const, label: "Project Hub" },
];

export function EditMenuItemDialog({ item, open, onOpenChange }: EditMenuItemDialogProps) {
  const { updateItem } = useMenuItems(item.category_id);
  const { categories } = useMenuCategories();
  
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    icon: item.icon,
    target_category_id: item.target_category_id || "",
    is_searchable: item.is_searchable,
    tool_type: (item.tool_type || "checklist") as ToolType,
    tool_mode: item.tool_mode as ToolMode,
    tool_is_searchable: item.tool_is_searchable,
  });

  // Reset form when item changes
  useEffect(() => {
    setFormData({
      name: item.name,
      description: item.description || "",
      icon: item.icon,
      target_category_id: item.target_category_id || "",
      is_searchable: item.is_searchable,
      tool_type: (item.tool_type || "checklist") as ToolType,
      tool_mode: item.tool_mode as ToolMode,
      tool_is_searchable: item.tool_is_searchable,
    });
  }, [item]);

  const handleUpdate = async () => {
    if (!formData.name.trim()) return;

    const input: UpdateMenuItemInput = {
      id: item.id,
      name: formData.name,
      description: formData.description || null,
      icon: formData.icon,
    };

    if (item.item_type === "submenu") {
      input.target_category_id = formData.target_category_id || null;
    } else if (item.item_type === "file_directory") {
      input.is_searchable = formData.is_searchable;
    } else if (item.item_type === "tool") {
      input.tool_type = formData.tool_type;
      input.tool_mode = formData.tool_mode;
      input.tool_is_searchable = formData.tool_mode === "unlimited" ? formData.tool_is_searchable : false;
    }

    await updateItem.mutateAsync(input);
    onOpenChange(false);
  };

  // Filter out current category from submenu targets
  const availableCategories = categories.filter(c => c.id !== item.category_id);

  const getItemTypeLabel = () => {
    switch (item.item_type) {
      case "submenu": return "Submenu";
      case "file_directory": return "File Directory";
      case "tool": return "Tool";
      default: return "Item";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {getItemTypeLabel()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Safety Procedures"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
            />
          </div>

          {item.item_type === "submenu" && (
            <div className="space-y-2">
              <Label>Target Category</Label>
              <Select
                value={formData.target_category_id}
                onValueChange={(value) => setFormData({ ...formData, target_category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category to link to" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {item.item_type === "file_directory" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="searchable">Enable Search Bar</Label>
              <Switch
                id="searchable"
                checked={formData.is_searchable}
                onCheckedChange={(checked) => setFormData({ ...formData, is_searchable: checked })}
              />
            </div>
          )}

          {item.item_type === "tool" && (
            <>
              <div className="space-y-2">
                <Label>Tool Type</Label>
                <Select
                  value={formData.tool_type}
                  onValueChange={(value: ToolType) => setFormData({ ...formData, tool_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOL_TYPES.map((tool) => (
                      <SelectItem key={tool.value} value={tool.value}>
                        {tool.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Mode</Label>
                <RadioGroup
                  value={formData.tool_mode}
                  onValueChange={(value: ToolMode) => setFormData({ ...formData, tool_mode: value })}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="edit-unlimited"
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer",
                      formData.tool_mode === "unlimited" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <RadioGroupItem value="unlimited" id="edit-unlimited" className="sr-only" />
                    <span className="font-medium text-sm">Unlimited</span>
                    <span className="text-xs text-muted-foreground text-center">Create multiple documents</span>
                  </Label>
                  <Label
                    htmlFor="edit-single"
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer",
                      formData.tool_mode === "single" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <RadioGroupItem value="single" id="edit-single" className="sr-only" />
                    <span className="font-medium text-sm">Single</span>
                    <span className="text-xs text-muted-foreground text-center">One document only</span>
                  </Label>
                </RadioGroup>
              </div>

              {formData.tool_mode === "unlimited" && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="tool-searchable">Enable Search Bar</Label>
                  <Switch
                    id="tool-searchable"
                    checked={formData.tool_is_searchable}
                    onCheckedChange={(checked) => setFormData({ ...formData, tool_is_searchable: checked })}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={!formData.name.trim() || updateItem.isPending}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
