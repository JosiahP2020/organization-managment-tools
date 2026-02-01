import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MenuItemSection } from "./MenuItemSection";
import { AddSubmenuDialog } from "./AddSubmenuDialog";
import { useMenuItems, type MenuItemSection as MenuItemSectionType } from "@/hooks/useMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemsColumnProps {
  categoryId: string;
  onItemClick?: (item: any) => void;
}

export function MenuItemsColumn({ categoryId, onItemClick }: MenuItemsColumnProps) {
  const { isAdmin } = useAuth();

  const {
    sections,
    isLoading,
    createSubmenu,
    createSection,
    updateItemName,
    deleteItem,
    reorderItems,
    moveItem,
    reorderSections,
  } = useMenuItems(categoryId);

  const [addSubmenuDialogOpen, setAddSubmenuDialogOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Collect all sortable IDs: sections first, then items
  const allSortableIds = [
    ...sections.map((section) => `section-${section.id}`),
    ...sections.flatMap((section) => section.items.map((item) => item.id)),
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !isAdmin) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    // Handle section reordering
    if (activeData.type === "section") {
      const activeId = (active.id as string).replace("section-", "");
      
      // Can drop on another section
      if (overData?.type === "section" && active.id !== over.id) {
        const overId = (over.id as string).replace("section-", "");
        
        const oldIndex = sections.findIndex((s) => s.id === activeId);
        const newIndex = sections.findIndex((s) => s.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newOrder = [...sections];
          const [moved] = newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, moved);
          reorderSections.mutate(newOrder.map((s) => s.id));
        }
      }
      return;
    }

    // Handle menu item dragging
    if (activeData.type !== "menu-item") return;

    const sourceSectionId = activeData.sectionId;

    // Determine target section
    let targetSectionId: string;
    if (overData?.type === "section-drop") {
      targetSectionId = overData.sectionId;
    } else if (overData?.type === "menu-item") {
      targetSectionId = overData.sectionId;
    } else {
      return;
    }

    // If same section, reorder
    if (sourceSectionId === targetSectionId) {
      const section = sections.find((s) => s.id === sourceSectionId);
      if (!section) return;

      const oldIndex = section.items.findIndex((item) => item.id === active.id);
      const newIndex = section.items.findIndex((item) => item.id === over.id);

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...section.items];
        const [moved] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved);
        reorderItems.mutate({
          sectionId: sourceSectionId,
          itemIds: newOrder.map((item) => item.id),
        });
      }
    } else {
      // Cross-section move
      const targetSection = sections.find((s) => s.id === targetSectionId);
      let newSortOrder = 0;

      if (targetSection && overData?.type === "menu-item") {
        const overIndex = targetSection.items.findIndex((item) => item.id === over.id);
        newSortOrder = overIndex >= 0 ? overIndex : targetSection.items.length;
      } else if (targetSection) {
        newSortOrder = targetSection.items.length;
      }

      moveItem.mutate({
        itemId: active.id as string,
        targetSectionId: targetSectionId === "default" ? null : targetSectionId,
        newSortOrder,
      });
    }
  };

  const handleAddSubmenu = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setAddSubmenuDialogOpen(true);
  };

  const handleCreateSubmenu = (data: { name: string; description?: string; icon: string }) => {
    createSubmenu.mutate({
      ...data,
      sectionId: currentSectionId,
    });
  };

  const handleAddSection = (afterSectionId: string) => {
    createSection.mutate({ title: "New Section", afterSectionId });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {sections.map((section, index) => (
              <MenuItemSection
                key={section.id}
                section={section}
                isAdmin={isAdmin}
                isLastSection={index === sections.length - 1}
                totalSections={sections.length}
                onTitleChange={(sectionId, newTitle) => 
                  updateItemName.mutate({ itemId: sectionId, name: newTitle })
                }
                onAddSubmenu={handleAddSubmenu}
                onAddSection={() => handleAddSection(section.id)}
                onDeleteSection={(sectionId) => deleteItem.mutate(sectionId)}
                onDeleteItem={(itemId) => deleteItem.mutate(itemId)}
                onEditItem={(itemId, name) => updateItemName.mutate({ itemId, name })}
                onItemClick={onItemClick}
              />
            ))}

            {/* Show add button if no sections exist */}
            {sections.length === 0 && isAdmin && (
              <div className="flex justify-center py-4">
                <AddSubmenuDialog
                  open={addSubmenuDialogOpen}
                  onOpenChange={setAddSubmenuDialogOpen}
                  onSubmit={handleCreateSubmenu}
                  isPending={createSubmenu.isPending}
                />
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <AddSubmenuDialog
        open={addSubmenuDialogOpen}
        onOpenChange={setAddSubmenuDialogOpen}
        onSubmit={handleCreateSubmenu}
        isPending={createSubmenu.isPending}
      />
    </>
  );
}