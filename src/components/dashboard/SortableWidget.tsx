import { Check } from "lucide-react";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import type { WidgetType, WidgetSize } from "@/types/widgets";
import { WIDGET_TYPES } from "@/types/widgets";
import { useSelectableItem } from "@/components/selection";
import { cn } from "@/lib/utils";

interface SortableWidgetProps {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  isAdmin: boolean;
  isFirst: boolean;
  isLast: boolean;
  surface: string;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SortableWidget({
  id,
  type,
  size,
  isAdmin,
  surface,
}: SortableWidgetProps) {
  const widgetName = WIDGET_TYPES.find((w) => w.type === type)?.name || "Widget";

  const { selected, longPressHandlers, handleClick } = useSelectableItem({
    surface,
    id,
    meta: { label: widgetName, type: "widget" },
    enabled: isAdmin,
  });

  return (
    <div
      className={cn(
        "relative rounded-lg transition-all",
        selected && "ring-2 ring-primary"
      )}
      {...longPressHandlers}
      onClick={handleClick()}
    >
      {selected && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow z-30">
          <Check className="h-3 w-3" />
        </div>
      )}

      <WidgetRenderer type={type} size={size} />
    </div>
  );
}
