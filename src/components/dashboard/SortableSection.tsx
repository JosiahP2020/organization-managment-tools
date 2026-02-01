import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EditableSectionTitle } from "./EditableSectionTitle";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { SortableMenuCard } from "./SortableMenuCard";
import type { DashboardSection } from "@/hooks/useDashboardSections";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";
import type { CardStyle } from "@/hooks/useOrganizationSettings";

interface SortableSectionProps {
  section: DashboardSection;
  cardStyle: CardStyle;
  isAdmin: boolean;
  isLastSection: boolean;
  onTitleChange: (sectionId: string, newTitle: string) => void;
  onAddMenu: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onCategoryClick: (category: DashboardCategory) => void;
  onReorderCategories: (sectionId: string, categoryIds: string[]) => void;
}

export function SortableSection({
  section,
  cardStyle,
  isAdmin,
  isLastSection,
  onTitleChange,
  onAddMenu,
  onAddSection,
  onDeleteSection,
  onDeleteCategory,
  onCategoryClick,
  onReorderCategories,
}: SortableSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = section.categories.findIndex((c) => c.id === active.id);
      const newIndex = section.categories.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...section.categories];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        onReorderCategories(section.id, newOrder.map((c) => c.id));
      }
    }
  };

  const canDelete = section.id !== "default";

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="mb-8 last:mb-0 group/section relative"
      >
        {/* Section Header with controls */}
        <div className="flex justify-center mb-4 relative">
          {/* Admin controls for section - visible on hover */}
          {isAdmin && canDelete && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
              {/* Drag handle */}
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-md cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
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

          <EditableSectionTitle
            title={section.title}
            onTitleChange={(newTitle) => onTitleChange(section.id, newTitle)}
            isEditable={isAdmin}
          />
        </div>

        {/* Category Cards Grid with drag-and-drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCardDragEnd}
        >
          <SortableContext
            items={section.categories.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start">
              {section.categories.map((category) => (
                <SortableMenuCard
                  key={category.id}
                  category={category}
                  cardStyle={cardStyle}
                  onClick={() => onCategoryClick(category)}
                  onDelete={() => onDeleteCategory(category.id)}
                  isAdmin={isAdmin}
                />
              ))}

              {/* Add button */}
              {isAdmin && (
                <div className="flex h-16 md:h-20 items-center justify-center">
                  <AddMenuCardButton
                    onAddMenu={() => onAddMenu(section.id)}
                    onAddSection={isLastSection ? onAddSection : undefined}
                  />
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDeleteSection(section.id);
          setShowDeleteDialog(false);
        }}
        title="Delete Section"
        description={`Are you sure you want to delete "${section.title}"? All menu cards in this section will be moved to the main menu.`}
      />
    </>
  );
}
