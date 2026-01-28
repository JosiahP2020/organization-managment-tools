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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWidgets, WidgetType } from "@/hooks/useWidgets";
import { WidgetBuilder } from "@/components/widgets/WidgetBuilder";
import { Clock, Pin, BarChart3, Link2, TrendingUp, Wand2 } from "lucide-react";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREBUILT_WIDGETS: { type: WidgetType; name: string; icon: React.ReactNode; description: string }[] = [
  { type: "recent_activity", name: "Recent Activity", icon: <Clock className="h-5 w-5" />, description: "Shows latest user actions" },
  { type: "pinned_items", name: "Pinned Items", icon: <Pin className="h-5 w-5" />, description: "User's pinned documents" },
  { type: "document_stats", name: "Document Stats", icon: <BarChart3 className="h-5 w-5" />, description: "Count of documents by type" },
  { type: "quick_links", name: "Quick Links", icon: <Link2 className="h-5 w-5" />, description: "Shortcuts to frequently used items" },
  { type: "progress", name: "Progress Tracker", icon: <TrendingUp className="h-5 w-5" />, description: "Completion percentages" },
];

export function AddWidgetDialog({ open, onOpenChange }: AddWidgetDialogProps) {
  const { createWidget } = useWidgets();
  const [showWidgetBuilder, setShowWidgetBuilder] = useState(false);

  const handleQuickAdd = (widget: typeof PREBUILT_WIDGETS[0]) => {
    createWidget.mutate({
      widget_type: widget.type,
      name: widget.name,
      config: {
        date_range: "7d",
        limit: 10,
        display_type: "list",
        show_checklists: true,
        show_guides: true,
        show_files: true,
      },
      size: "medium",
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (showWidgetBuilder) {
    return (
      <WidgetBuilder
        open={showWidgetBuilder}
        onOpenChange={(open) => {
          setShowWidgetBuilder(open);
          if (!open) onOpenChange(false);
        }}
        onComplete={() => {
          setShowWidgetBuilder(false);
          onOpenChange(false);
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a pre-built widget for quick setup, or create a custom widget.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="prebuilt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prebuilt">Pre-built Widgets</TabsTrigger>
            <TabsTrigger value="custom">Custom Widget</TabsTrigger>
          </TabsList>

          <TabsContent value="prebuilt" className="mt-4">
            <div className="grid grid-cols-1 gap-3">
              {PREBUILT_WIDGETS.map((widget) => (
                <Button
                  key={widget.type}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => handleQuickAdd(widget)}
                  disabled={createWidget.isPending}
                >
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    {widget.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{widget.name}</p>
                    <p className="text-xs text-muted-foreground">{widget.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <div className="text-center py-8">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Widget Builder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a fully customized widget with your preferred data sources, filters, and display options.
              </p>
              <Button onClick={() => setShowWidgetBuilder(true)}>
                Open Widget Builder
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
