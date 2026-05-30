import { useState, useCallback } from "react";
import { AddWidgetButton } from "./AddWidgetButton";
import { SortableWidget } from "./SortableWidget";
import { useWidgetSelectionAdapter } from "./useWidgetSelectionAdapter";
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

function useWidgetContainer(initial: WidgetInstance[], surface: string) {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(initial);

  const handleWidgetAdd = (type: WidgetType, size: WidgetSize) => {
    setWidgets((w) => [...w, { id: crypto.randomUUID(), type, size }]);
  };

  const handleWidgetDelete = (id: string) => {
    setWidgets((w) => w.filter((x) => x.id !== id));
  };

  const handleBulkDelete = useCallback((ids: string[]) => {
    setWidgets((w) => w.filter((x) => !ids.includes(x.id)));
  }, []);

  const handleMoveUp = (id: string) => {
    setWidgets((w) => {
      const i = w.findIndex((x) => x.id === id);
      if (i <= 0) return w;
      const next = [...w];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const handleMoveDown = (id: string) => {
    setWidgets((w) => {
      const i = w.findIndex((x) => x.id === id);
      if (i < 0 || i >= w.length - 1) return w;
      const next = [...w];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  useWidgetSelectionAdapter(surface, handleBulkDelete);

  return { widgets, surface, handleWidgetAdd, handleWidgetDelete, handleMoveUp, handleMoveDown };
}

export function WidgetColumn() {
  const { isAdmin } = useAuth();
  const { widgets, surface, handleWidgetAdd, handleWidgetDelete, handleMoveUp, handleMoveDown } =
    useWidgetContainer(defaultColumnWidgets, "dashboard:widgets:column");

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
          surface={surface}
          onDelete={() => handleWidgetDelete(widget.id)}
          onMoveUp={() => handleMoveUp(widget.id)}
          onMoveDown={() => handleMoveDown(widget.id)}
        />
      ))}
      {isAdmin && (
        <div className="flex justify-center pt-2">
          <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
        </div>
      )}
    </div>
  );
}

export function SidebarWidgets() {
  const { isAdmin } = useAuth();
  const { widgets, surface, handleWidgetAdd, handleWidgetDelete, handleMoveUp, handleMoveDown } =
    useWidgetContainer(defaultSidebarWidgets, "dashboard:widgets:sidebar");

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
          surface={surface}
          onDelete={() => handleWidgetDelete(widget.id)}
          onMoveUp={() => handleMoveUp(widget.id)}
          onMoveDown={() => handleMoveDown(widget.id)}
        />
      ))}
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
  const { isAdmin } = useAuth();
  const { widgets, surface, handleWidgetAdd, handleWidgetDelete, handleMoveUp, handleMoveDown } =
    useWidgetContainer(defaultColumnWidgets, "dashboard:widgets:grid");

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
          surface={surface}
          onDelete={() => handleWidgetDelete(widget.id)}
          onMoveUp={() => handleMoveUp(widget.id)}
          onMoveDown={() => handleMoveDown(widget.id)}
        />
      ))}
      {isAdmin && (
        <div className="flex items-center justify-center min-h-[100px]">
          <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
        </div>
      )}
    </div>
  );
}
