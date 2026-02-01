import { useState } from "react";
import { AddWidgetButton } from "./AddWidgetButton";
import { SortableWidget } from "./SortableWidget";
import type { WidgetType, WidgetSize } from "@/types/widgets";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAdmin } = useAuth();

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      type,
      size,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleWidgetDelete = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleMoveUp = (id: string) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
      setWidgets(newWidgets);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      setWidgets(newWidgets);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {widgets.map((widget, index) => (
        <SortableWidget
          key={widget.id}
          id={widget.id}
          type={widget.type}
          size={widget.size}
          isAdmin={isAdmin}
          isFirst={index === 0}
          isLast={index === widgets.length - 1}
          onDelete={() => handleWidgetDelete(widget.id)}
          onMoveUp={() => handleMoveUp(widget.id)}
          onMoveDown={() => handleMoveDown(widget.id)}
        />
      ))}
      {/* Add widget button */}
      {isAdmin && (
        <div className="flex justify-center pt-2">
          <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
        </div>
      )}
    </div>
  );
}

export function SidebarWidgets() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultSidebarWidgets);
  const { isAdmin } = useAuth();

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      type,
      size,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleWidgetDelete = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleMoveUp = (id: string) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
      setWidgets(newWidgets);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      setWidgets(newWidgets);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {widgets.map((widget, index) => (
        <SortableWidget
          key={widget.id}
          id={widget.id}
          type={widget.type}
          size={widget.size}
          isAdmin={isAdmin}
          isFirst={index === 0}
          isLast={index === widgets.length - 1}
          onDelete={() => handleWidgetDelete(widget.id)}
          onMoveUp={() => handleMoveUp(widget.id)}
          onMoveDown={() => handleMoveDown(widget.id)}
        />
      ))}
      {/* Add widget button */}
      {isAdmin && (
        <div className="flex justify-center pt-2">
          <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
        </div>
      )}
    </div>
  );
}

// Grid layout for widgets - flows left to right, then wraps down
export function WidgetGrid() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultColumnWidgets);
  const { isAdmin } = useAuth();

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      type,
      size,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleWidgetDelete = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleMoveUp = (id: string) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
      setWidgets(newWidgets);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      setWidgets(newWidgets);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {widgets.map((widget, index) => (
        <SortableWidget
          key={widget.id}
          id={widget.id}
          type={widget.type}
          size={widget.size}
          isAdmin={isAdmin}
          isFirst={index === 0}
          isLast={index === widgets.length - 1}
          onDelete={() => handleWidgetDelete(widget.id)}
          onMoveUp={() => handleMoveUp(widget.id)}
          onMoveDown={() => handleMoveDown(widget.id)}
        />
      ))}
      {/* Add widget button */}
      {isAdmin && (
        <div className="flex items-center justify-center min-h-[100px]">
          <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
        </div>
      )}
    </div>
  );
}
