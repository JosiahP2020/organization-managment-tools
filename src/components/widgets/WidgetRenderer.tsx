import { Widget } from "@/hooks/useWidgets";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { PinnedItemsWidget } from "./PinnedItemsWidget";
import { DocumentStatsWidget } from "./DocumentStatsWidget";
import { QuickLinksWidget } from "./QuickLinksWidget";
import { ProgressWidget } from "./ProgressWidget";

interface WidgetRendererProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
}

export function WidgetRenderer({ widget, onEdit, onDelete }: WidgetRendererProps) {
  const commonProps = { widget, onEdit, onDelete };

  switch (widget.widget_type) {
    case "recent_activity":
      return <RecentActivityWidget {...commonProps} />;
    case "pinned_items":
      return <PinnedItemsWidget {...commonProps} />;
    case "document_stats":
      return <DocumentStatsWidget {...commonProps} />;
    case "quick_links":
      return <QuickLinksWidget {...commonProps} />;
    case "progress":
      return <ProgressWidget {...commonProps} />;
    default:
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Unknown widget type: {widget.widget_type}</p>
        </div>
      );
  }
}
