import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import type { WidgetType, WidgetSize } from "@/types/widgets";
import { WIDGET_TYPES } from "@/types/widgets";

interface SortableWidgetProps {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  isAdmin: boolean;
  isFirst: boolean;
  isLast: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SortableWidget({
  id,
  type,
  size,
  isAdmin,
  isFirst,
  isLast,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SortableWidgetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const widgetName = WIDGET_TYPES.find((w) => w.type === type)?.name || "Widget";

  return (
    <>
      <div className="group relative">
        {/* Admin controls - visible on hover */}
        {isAdmin && (
          <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isFirst && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-md"
                onClick={onMoveUp}
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {!isLast && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-md"
                onClick={onMoveDown}
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            {/* Delete button */}
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 shadow-md"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <WidgetRenderer type={type} size={size} />
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        title="Delete Widget"
        description={`Are you sure you want to delete the "${widgetName}" widget?`}
      />
    </>
  );
}
