import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
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

  // Section droppable (for receiving items)
  const { setNodeRef, isOver } = useDroppable({
    id: `section-drop-${section.id}`,
    data: {
      type: "section-drop",
      sectionId: section.id,
    },
  });

  const canDelete = section.id !== "default";
  // Only show section title if there's more than one section
  const showSectionTitle = totalSections > 1 && section.id !== "default";

  return (
    <>
      <div className="mb-6 last:mb-0 group/section relative">
        {/* Section Header - only show if more than one section */}
        {showSectionTitle && (
          <div className="flex justify-center mb-3 relative">
            {/* Admin controls for section */}
            {isAdmin && canDelete && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 shadow-md cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
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
        )}

        {/* Items list - droppable zone */}
        <div
          ref={setNodeRef}
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
