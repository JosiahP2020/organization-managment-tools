import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { EditableSectionTitle } from "@/components/dashboard/EditableSectionTitle";
import { AddMenuItemButton } from "./AddMenuItemButton";
import { MenuItemCard } from "./MenuItemCard";
import type { MenuItemSection as MenuItemSectionType } from "@/hooks/useMenuItems";

interface MenuItemSectionProps {
  section: MenuItemSectionType;
  isAdmin: boolean;
  isLastSection: boolean;
  totalSections: number;
  onTitleChange: (sectionId: string, newTitle: string) => void;
  onAddSubmenu: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (itemId: string, name: string) => void;
  onItemClick?: (item: any) => void;
}

export function MenuItemSection({
  section,
  isAdmin,
  isLastSection,
  totalSections,
  onTitleChange,
  onAddSubmenu,
  onAddSection,
  onDeleteSection,
  onDeleteItem,
  onEditItem,
  onItemClick,
}: MenuItemSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Section sortable (for reordering sections)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `section-${section.id}`,
    data: {
      type: "section",
      sectionId: section.id,
    },
    disabled: !isAdmin || section.id === "default",
  });

  // Section droppable (for receiving items)
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
  const canDrag = section.id !== "default";
  // Show section titles for ALL sections when there are 2+ sections
  const showSectionTitle = totalSections > 1;

  return (
    <>
      <div
        ref={setSortableRef}
        style={style}
        className="mb-6 last:mb-0 group/section relative"
      >
        {/* Section Header - only show if more than one section */}
        {showSectionTitle && (
          <div className="flex justify-center mb-3 relative">
            {/* Admin controls for section */}
            {isAdmin && (canDelete || canDrag) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                {canDrag && (
                  <Button
                    ref={setActivatorNodeRef}
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 shadow-md cursor-grab active:cursor-grabbing touch-none"
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 shadow-md"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            <EditableSectionTitle
              title={section.title}
              onTitleChange={(newTitle) => onTitleChange(section.id, newTitle)}
              isEditable={isAdmin}
            />
          </div>
        )}

        {/* Items list - droppable zone */}
        <div
          ref={setDroppableRef}
          className={`flex flex-col gap-2 min-h-[3rem] rounded-xl p-2 transition-colors ${
            isOver ? "bg-primary/10 ring-2 ring-primary/50" : ""
          }`}
        >
          {section.items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              sectionId={section.id}
              isAdmin={isAdmin}
              onDelete={() => onDeleteItem(item.id)}
              onEdit={(name) => onEditItem(item.id, name)}
              onClick={() => onItemClick?.(item)}
            />
          ))}

          {/* Add button */}
          {isAdmin && (
            <div className="flex justify-center py-2">
              <AddMenuItemButton
                onAddSubmenu={() => onAddSubmenu(section.id)}
                onAddSection={onAddSection}
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
        description={`Are you sure you want to delete "${section.title}"? All items in this section will be moved to the default section.`}
      />
    </>
  );
}