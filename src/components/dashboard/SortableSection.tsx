import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
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
  isFirstSection: boolean;
  isLastSection: boolean;
  onTitleChange: (sectionId: string, newTitle: string) => void;
  onAddMenu: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onCategoryClick: (category: DashboardCategory) => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
  onMoveCategoryUp: (categoryId: string, sectionId: string) => void;
  onMoveCategoryDown: (categoryId: string, sectionId: string) => void;
}

export function SortableSection({
  section,
  cardStyle,
  isAdmin,
  isFirstSection,
  isLastSection,
  onTitleChange,
  onAddMenu,
  onAddSection,
  onDeleteSection,
  onDeleteCategory,
  onCategoryClick,
  onMoveUp,
  onMoveDown,
  onMoveCategoryUp,
  onMoveCategoryDown,
}: SortableSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Section droppable (for receiving cards)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-drop-${section.id}`,
    data: {
      type: "section-drop",
      sectionId: section.id,
    },
  });

  const canDelete = section.id !== "default";
  const canMoveUp = section.id !== "default" && !isFirstSection;
  const canMoveDown = section.id !== "default" && !isLastSection;

  return (
    <>
      <div className="mb-8 last:mb-0 group/section relative">
        {/* Section Header with controls */}
        <div className="flex justify-center mb-4 relative">
          <EditableSectionTitle
            title={section.title}
            onTitleChange={(newTitle) => onTitleChange(section.id, newTitle)}
            isEditable={isAdmin}
          />

          {/* Admin controls for section - on the right */}
          {isAdmin && (canDelete || canMoveUp || canMoveDown) && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
              {canMoveUp && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 shadow-md"
                  onClick={() => onMoveUp(section.id)}
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              {canMoveDown && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 shadow-md"
                  onClick={() => onMoveDown(section.id)}
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 shadow-md"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Delete section"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Category Cards Grid - droppable zone */}
        <div 
          ref={setDroppableRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start min-h-[4rem] rounded-xl transition-colors ${
            isOver ? "bg-primary/10 ring-2 ring-primary/50" : ""
          }`}
        >
          {section.categories.map((category, index) => (
            <SortableMenuCard
              key={category.id}
              category={category}
              cardStyle={cardStyle}
              sectionId={section.id}
              isFirst={index === 0}
              isLast={index === section.categories.length - 1}
              onClick={() => onCategoryClick(category)}
              onDelete={() => onDeleteCategory(category.id)}
              onMoveUp={() => onMoveCategoryUp(category.id, section.id)}
              onMoveDown={() => onMoveCategoryDown(category.id, section.id)}
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
