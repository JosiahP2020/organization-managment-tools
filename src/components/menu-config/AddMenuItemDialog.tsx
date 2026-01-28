import { useState } from "react";
import { FolderTree, FileBox, Wrench } from "lucide-react";
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
import { useMenuItems, CreateMenuItemInput } from "@/hooks/useMenuItems";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { cn } from "@/lib/utils";

interface AddMenuItemDialogProps {
  categoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ItemType = "submenu" | "file_directory" | "tool";
type ToolType = "checklist" | "sop_guide" | "project_hub";
type ToolMode = "unlimited" | "single";

const ITEM_TYPES = [
  { 
    value: "submenu" as const, 
    label: "Submenu", 
    description: "Link to another menu category",
    icon: FolderTree 
  },
  { 
    value: "file_directory" as const, 
    label: "File Directory", 
    description: "Upload and search documents",
    icon: FileBox 
  },
  { 
    value: "tool" as const, 
    label: "Tool", 
    description: "Checklist, SOP Guide, or Project Hub",
    icon: Wrench 
  },
];

const TOOL_TYPES = [
  { value: "checklist" as const, label: "Checklist" },
  { value: "sop_guide" as const, label: "SOP Guide" },
  { value: "project_hub" as const, label: "Project Hub" },
];

export function AddMenuItemDialog({ categoryId, open, onOpenChange }: AddMenuItemDialogProps) {
  const { createItem } = useMenuItems(categoryId);
  const { categories } = useMenuCategories();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [itemType, setItemType] = useState<ItemType>("file_directory");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "file",
    target_category_id: "",
    is_searchable: true,
    tool_type: "checklist" as ToolType,
    tool_mode: "unlimited" as ToolMode,
    tool_is_searchable: true,
  });

  const resetForm = () => {
    setStep(1);
    setItemType("file_directory");
    setFormData({
      name: "",
      description: "",
      icon: "file",
      target_category_id: "",
      is_searchable: true,
      tool_type: "checklist",
      tool_mode: "unlimited",
      tool_is_searchable: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    const input: CreateMenuItemInput = {
      category_id: categoryId,
      name: formData.name,
      description: formData.description || undefined,
      icon: formData.icon,
      item_type: itemType,
    };

    if (itemType === "submenu") {
      input.target_category_id = formData.target_category_id || null;
    } else if (itemType === "file_directory") {
      input.is_searchable = formData.is_searchable;
    } else if (itemType === "tool") {
      input.tool_type = formData.tool_type;
      input.tool_mode = formData.tool_mode;
      input.tool_is_searchable = formData.tool_mode === "unlimited" ? formData.tool_is_searchable : false;
    }

    await createItem.mutateAsync(input);
    handleClose();
  };

  // Set default icon based on type
  const handleTypeSelect = (type: ItemType) => {
    setItemType(type);
    let defaultIcon = "file";
    if (type === "submenu") defaultIcon = "folder";
    else if (type === "file_directory") defaultIcon = "files";
    else if (type === "tool") defaultIcon = "clipboard-list";
    setFormData({ ...formData, icon: defaultIcon });
    setStep(2);
  };

  // Filter out current category from submenu targets
  const availableCategories = categories.filter(c => c.id !== categoryId);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Choose Item Type" : `Add ${ITEM_TYPES.find(t => t.value === itemType)?.label}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-3 py-4">
            {ITEM_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border border-border text-left",
                  "hover:border-primary/50 hover:bg-accent/50 transition-colors"
                )}
              >
                <div className="p-2 rounded-md bg-primary/10">
                  <type.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
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

            {itemType === "submenu" && (
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

            {itemType === "file_directory" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="searchable">Enable Search Bar</Label>
                <Switch
                  id="searchable"
                  checked={formData.is_searchable}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_searchable: checked })}
                />
              </div>
            )}

            {itemType === "tool" && (
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
                      htmlFor="unlimited"
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer",
                        formData.tool_mode === "unlimited" ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <RadioGroupItem value="unlimited" id="unlimited" className="sr-only" />
                      <span className="font-medium text-sm">Unlimited</span>
                      <span className="text-xs text-muted-foreground text-center">Create multiple documents</span>
                    </Label>
                    <Label
                      htmlFor="single"
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer",
                        formData.tool_mode === "single" ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <RadioGroupItem value="single" id="single" className="sr-only" />
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
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 2 && (
            <Button 
              onClick={handleCreate}
              disabled={!formData.name.trim() || createItem.isPending}
            >
              Add Item
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
