import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { WIDGET_TYPES, type WidgetType, type WidgetSize } from "@/types/widgets";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { toast } from "sonner";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWidgetAdd?: (type: WidgetType, size: WidgetSize) => void;
}

export function AddWidgetDialog({ open, onOpenChange, onWidgetAdd }: AddWidgetDialogProps) {
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedSize, setSelectedSize] = useState<WidgetSize>("medium");

  const handleAdd = () => {
    if (!selectedType) {
      toast.error("Please select a widget type");
      return;
    }

    if (onWidgetAdd) {
      onWidgetAdd(selectedType, selectedSize);
    }

    toast.success(`${WIDGET_TYPES.find(w => w.type === selectedType)?.name} widget added`);
    
    // Reset and close
    setSelectedType(null);
    setSelectedSize("medium");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedType(null);
    setSelectedSize("medium");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget type to add to your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Widget Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {WIDGET_TYPES.map((widget) => (
              <button
                key={widget.type}
                onClick={() => {
                  setSelectedType(widget.type);
                  setSelectedSize(widget.defaultSize);
                }}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                  selectedType === widget.type
                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedType === widget.type ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <DynamicIcon name={widget.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {widget.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {widget.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Size Selection */}
          {selectedType && (
            <div className="pt-4 border-t border-border">
              <Label className="text-sm font-medium mb-3 block">Widget Size</Label>
              <RadioGroup
                value={selectedSize}
                onValueChange={(value) => setSelectedSize(value as WidgetSize)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="size-small" />
                  <Label htmlFor="size-small" className="font-normal cursor-pointer">
                    Small
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="size-medium" />
                  <Label htmlFor="size-medium" className="font-normal cursor-pointer">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="size-large" />
                  <Label htmlFor="size-large" className="font-normal cursor-pointer">
                    Large
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedType}>
            Add Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
