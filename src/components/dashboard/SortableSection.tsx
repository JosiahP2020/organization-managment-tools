import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
}: SortableSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Section sortable (for reordering sections)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    data: { type: "section" },
    disabled: section.id === "default", // Prevent dragging default section
  });

  // Section droppable (for receiving cards)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-drop-${section.id}`,
    data: {
      type: "section-drop",
      sectionId: section.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const canDelete = section.id !== "default";

  return (
    <>
      <div
        ref={setSortableRef}
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

        {/* Category Cards Grid - droppable zone */}
        <div 
          ref={setDroppableRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start min-h-[4rem] rounded-xl transition-colors ${
            isOver ? "bg-primary/10 ring-2 ring-primary/50" : ""
          }`}
        >
          {section.categories.map((category) => (
            <SortableMenuCard
              key={category.id}
              category={category}
              cardStyle={cardStyle}
              sectionId={section.id}
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
