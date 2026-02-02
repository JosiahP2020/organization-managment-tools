import { useState } from "react";
import { CheckSquare, Grid3X3, ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type ToolType = "checklist" | "sop_guide" | "follow_up_list";
export type ToolMode = "unlimited" | "single";

interface AddToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    toolType: ToolType;
    toolMode: ToolMode;
  }) => void;
  isPending?: boolean;
}

const toolOptions = [
  {
    value: "checklist" as ToolType,
    label: "Checklist",
    icon: CheckSquare,
    description: "Create a checklist with tasks and items",
  },
  {
    value: "sop_guide" as ToolType,
    label: "SOP Guide",
    icon: Grid3X3,
    description: "Create a visual SOP guide with images",
  },
  {
    value: "follow_up_list" as ToolType,
    label: "Follow-up List",
    icon: ListChecks,
    description: "Track follow-up items and tasks",
  },
];

export function AddToolDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: AddToolDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toolType, setToolType] = useState<ToolType>("checklist");
  const [toolMode, setToolMode] = useState<ToolMode>("unlimited");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      toolType,
      toolMode,
    });

    // Reset form
    setName("");
    setDescription("");
    setToolType("checklist");
    setToolMode("unlimited");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setDescription("");
      setToolType("checklist");
      setToolMode("unlimited");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tool</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tool Type Selection */}
          <div className="space-y-3">
            <Label>Tool Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {toolOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = toolType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setToolType(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      "hover:border-primary/50 hover:bg-accent/50",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium text-center",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="tool-name">Title</Label>
            <Input
              id="tool-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tool title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="tool-description">Description (optional)</Label>
            <Textarea
              id="tool-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              rows={2}
            />
          </div>

          {/* Usage Mode */}
          <div className="space-y-3">
            <Label>Usage Mode</Label>
            <RadioGroup
              value={toolMode}
              onValueChange={(value) => setToolMode(value as ToolMode)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-muted hover:border-primary/50 transition-colors">
                <RadioGroupItem value="unlimited" id="mode-unlimited" />
                <div className="flex-1">
                  <Label htmlFor="mode-unlimited" className="font-medium cursor-pointer">
                    Unlimited
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Manage multiple documents from this tool
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-muted hover:border-primary/50 transition-colors">
                <RadioGroupItem value="single" id="mode-single" />
                <div className="flex-1">
                  <Label htmlFor="mode-single" className="font-medium cursor-pointer">
                    Single-use
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    One specific document linked to this tool
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? "Creating..." : "Create Tool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
