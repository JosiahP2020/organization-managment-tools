import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);
      setWidgets(newWidgets);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              size={widget.size}
              isAdmin={isAdmin}
              onDelete={() => handleWidgetDelete(widget.id)}
            />
          ))}
          {/* Add widget button */}
          {isAdmin && (
            <div className="flex justify-center pt-2">
              <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export function SidebarWidgets() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultSidebarWidgets);
  const { isAdmin } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);
      setWidgets(newWidgets);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              size={widget.size}
              isAdmin={isAdmin}
              onDelete={() => handleWidgetDelete(widget.id)}
            />
          ))}
          {/* Add widget button */}
          {isAdmin && (
            <div className="flex justify-center pt-2">
              <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Grid layout for widgets - flows left to right, then wraps down
export function WidgetGrid() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(defaultColumnWidgets);
  const { isAdmin } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);
      setWidgets(newWidgets);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              size={widget.size}
              isAdmin={isAdmin}
              onDelete={() => handleWidgetDelete(widget.id)}
            />
          ))}
          {/* Add widget button */}
          {isAdmin && (
            <div className="flex items-center justify-center min-h-[100px]">
              <AddWidgetButton onWidgetAdd={handleWidgetAdd} />
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
