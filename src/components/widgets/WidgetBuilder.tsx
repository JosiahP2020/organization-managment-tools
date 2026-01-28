import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { WidgetType, DisplayType, WidgetSize, WidgetConfig, useWidgets } from "@/hooks/useWidgets";
import { Clock, Pin, BarChart3, Link2, TrendingUp } from "lucide-react";

interface WidgetBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const WIDGET_TYPES: { value: WidgetType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "recent_activity", label: "Recent Activity", icon: <Clock className="h-5 w-5" />, description: "Shows latest user actions" },
  { value: "pinned_items", label: "Pinned Items", icon: <Pin className="h-5 w-5" />, description: "User's pinned documents" },
  { value: "document_stats", label: "Document Stats", icon: <BarChart3 className="h-5 w-5" />, description: "Count of documents by type" },
  { value: "quick_links", label: "Quick Links", icon: <Link2 className="h-5 w-5" />, description: "Shortcuts to frequently used items" },
  { value: "progress", label: "Progress Tracker", icon: <TrendingUp className="h-5 w-5" />, description: "Completion percentages" },
];

const DISPLAY_TYPES: { value: DisplayType; label: string }[] = [
  { value: "list", label: "List" },
  { value: "counter", label: "Counter" },
  { value: "progress_bar", label: "Progress Bar" },
  { value: "table", label: "Table" },
];

const SIZES: { value: WidgetSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export function WidgetBuilder({ open, onOpenChange, onComplete }: WidgetBuilderProps) {
  const { createWidget } = useWidgets();
  const [step, setStep] = useState(1);
  const [widgetType, setWidgetType] = useState<WidgetType>("recent_activity");
  const [config, setConfig] = useState<WidgetConfig>({
    date_range: "7d",
    limit: 10,
    display_type: "list",
    show_checklists: true,
    show_guides: true,
    show_files: true,
  });
  const [size, setSize] = useState<WidgetSize>("medium");
  const [name, setName] = useState("");

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    const finalName = name.trim() || WIDGET_TYPES.find(w => w.value === widgetType)?.label || "Widget";
    
    createWidget.mutate({
      widget_type: widgetType,
      name: finalName,
      config,
      size,
    }, {
      onSuccess: () => {
        handleClose();
        onComplete?.();
      }
    });
  };

  const handleClose = () => {
    setStep(1);
    setWidgetType("recent_activity");
    setConfig({
      date_range: "7d",
      limit: 10,
      display_type: "list",
      show_checklists: true,
      show_guides: true,
      show_files: true,
    });
    setSize("medium");
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Choose Widget Type"}
            {step === 2 && "Configure Data Source"}
            {step === 3 && "Display Options"}
            {step === 4 && "Name & Save"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Choose Widget Type */}
          {step === 1 && (
            <RadioGroup value={widgetType} onValueChange={(v) => setWidgetType(v as WidgetType)}>
              <div className="space-y-3">
                {WIDGET_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {type.icon}
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Configure Data Source */}
          {step === 2 && (
            <div className="space-y-4">
              {(widgetType === "recent_activity" || widgetType === "pinned_items") && (
                <>
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select
                      value={config.date_range}
                      onValueChange={(v) => setConfig({ ...config, date_range: v as "7d" | "30d" | "all" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Item Limit</Label>
                    <Select
                      value={String(config.limit)}
                      onValueChange={(v) => setConfig({ ...config, limit: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {widgetType === "document_stats" && (
                <div className="space-y-3">
                  <Label>Show Document Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-checklists"
                        checked={config.show_checklists}
                        onCheckedChange={(checked) => setConfig({ ...config, show_checklists: !!checked })}
                      />
                      <Label htmlFor="show-checklists">Checklists</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-guides"
                        checked={config.show_guides}
                        onCheckedChange={(checked) => setConfig({ ...config, show_guides: !!checked })}
                      />
                      <Label htmlFor="show-guides">SOP Guides</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-files"
                        checked={config.show_files}
                        onCheckedChange={(checked) => setConfig({ ...config, show_files: !!checked })}
                      />
                      <Label htmlFor="show-files">Documents/Files</Label>
                    </div>
                  </div>
                </div>
              )}

              {widgetType === "quick_links" && (
                <p className="text-sm text-muted-foreground">
                  Quick links can be configured after the widget is created. You'll be able to add links to your frequently used documents.
                </p>
              )}

              {widgetType === "progress" && (
                <p className="text-sm text-muted-foreground">
                  The progress tracker will show completion status across all your checklists and documents.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Display Options */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Type</Label>
                <Select
                  value={config.display_type}
                  onValueChange={(v) => setConfig({ ...config, display_type: v as DisplayType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPLAY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Widget Size</Label>
                <RadioGroup value={size} onValueChange={(v) => setSize(v as WidgetSize)}>
                  <div className="flex gap-4">
                    {SIZES.map((s) => (
                      <div key={s.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={s.value} id={s.value} />
                        <Label htmlFor={s.value}>{s.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 4: Name & Save */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget Name</Label>
                <Input
                  id="widget-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={WIDGET_TYPES.find(w => w.value === widgetType)?.label || "Widget"}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the default name
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Summary</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Type: {WIDGET_TYPES.find(w => w.value === widgetType)?.label}</li>
                  <li>Size: {SIZES.find(s => s.value === size)?.label}</li>
                  <li>Display: {DISPLAY_TYPES.find(d => d.value === config.display_type)?.label}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={createWidget.isPending}>
                {createWidget.isPending ? "Creating..." : "Create Widget"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
