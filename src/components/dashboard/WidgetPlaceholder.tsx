import { useState } from "react";
import { AddWidgetButton } from "./AddWidgetButton";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import type { WidgetType, WidgetSize } from "@/types/widgets";

interface WidgetInstance {
  id: string;
  type: WidgetType;
  size: WidgetSize;
}

// Default widgets for each column type
const defaultColumnWidgets: WidgetInstance[] = [
  { id: "1", type: "quick-stats", size: "medium" },
  { id: "2", type: "recent-activity", size: "medium" },
  { id: "3", type: "notifications", size: "small" },
];

const defaultSidebarWidgets: WidgetInstance[] = [
  { id: "1", type: "clock-date", size: "small" },
  { id: "2", type: "break-times", size: "small" },
  { id: "3", type: "upcoming-tasks", size: "small" },
];

export function WidgetColumn() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultColumnWidgets);

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      type,
      size,
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="flex flex-col gap-4">
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} type={widget.type} size={widget.size} />
      ))}
      {/* Add widget button */}
      <div className="flex justify-center pt-2">
        <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
      </div>
    </div>
  );
}

export function SidebarWidgets() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultSidebarWidgets);

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      type,
      size,
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="flex flex-col gap-3">
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} type={widget.type} size={widget.size} />
      ))}
      {/* Add widget button */}
      <div className="flex justify-center pt-2">
        <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
      </div>
    </div>
  );
}

// Grid layout for widgets - flows left to right, then wraps down
export function WidgetGrid() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultColumnWidgets);

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      type,
      size,
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} type={widget.type} size={widget.size} />
      ))}
      {/* Add widget button */}
      <div className="flex items-center justify-center min-h-[100px]">
        <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
      </div>
    </div>
  );
}
