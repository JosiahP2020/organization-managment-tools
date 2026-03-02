import { useState, useEffect, useRef } from "react";
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
import { AddFileDirectoryDialog } from "./AddFileDirectoryDialog";
import { AddToolDialog, type ToolType, type ToolMode } from "./AddToolDialog";
import { AddTextDialog } from "./AddTextDialog";
import { useMenuItems, type MenuItemSection as MenuItemSectionType } from "@/hooks/useMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { useDriveExport } from "@/hooks/useDriveExport";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemsColumnProps {
  categoryId: string;
  onItemClick?: (item: any) => void;
}

export function MenuItemsColumn({ categoryId, onItemClick }: MenuItemsColumnProps) {
  const { isAdmin } = useAuth();
  const driveExport = useDriveExport();

  const {
    sections,
    isLoading,
    createSubmenu,
    createFileDirectory,
    createTool,
    createTextDisplay,
    createSection,
    updateItemName,
    deleteItem,
    reorderItems,
    moveItem,
    moveSectionUp,
    moveSectionDown,
    moveItemUp,
    moveItemDown,
  } = useMenuItems(categoryId);

  const [addSubmenuDialogOpen, setAddSubmenuDialogOpen] = useState(false);
  const [addFileDirectoryDialogOpen, setAddFileDirectoryDialogOpen] = useState(false);
  const [addToolDialogOpen, setAddToolDialogOpen] = useState(false);
  const [addTextDialogOpen, setAddTextDialogOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Collect all item IDs for SortableContext
  const allItemIds = sections.flatMap((section) => section.items.map((item) => item.id));

  // Auto-sync: resync all exported items when entering this page
  const autoSyncDoneRef = useRef(false);
  useEffect(() => {
    if (autoSyncDoneRef.current || !driveExport.isConnected || !driveExport.driveRefs.length || !sections.length) return;
    autoSyncDoneRef.current = true;

    // Collect items that have drive refs
    const itemsToSync: Array<{ type: string; id: string }> = [];
    for (const section of sections) {
      for (const item of section.items) {
        let driveType: string | null = null;
        if (item.item_type === "text_display") driveType = "text_display";
        else if (item.item_type === "tool") {
          const toolType = (item as any).tool_type;
          if (toolType === "checklist" || toolType === "follow_up_list") driveType = "checklist";
          else if (toolType === "sop_guide") driveType = "gemba_doc";
        }
        if (driveType && driveExport.getRef(item.id)) {
          itemsToSync.push({ type: driveType, id: item.id });
        }
      }
    }

    if (itemsToSync.length > 0) {
      console.log(`Auto-syncing ${itemsToSync.length} items to Drive...`);
      driveExport.syncAllForCategory(itemsToSync);
    }
  }, [sections, driveExport.isConnected, driveExport.driveRefs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !isAdmin) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "menu-item") return;

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

  const handleAddFileDirectory = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setAddFileDirectoryDialogOpen(true);
  };

  const handleAddTool = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setAddToolDialogOpen(true);
  };

  const handleAddText = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setAddTextDialogOpen(true);
  };

  const handleCreateSubmenu = (data: { name: string; description?: string; icon: string }) => {
    createSubmenu.mutate({
      ...data,
      sectionId: currentSectionId,
    });
  };

  const handleCreateFileDirectory = (data: { name: string; description?: string; icon: string }) => {
    createFileDirectory.mutate({
      ...data,
      sectionId: currentSectionId,
    });
  };

  const handleCreateTool = (data: { name: string; description?: string; toolType: ToolType; toolMode: ToolMode }) => {
    createTool.mutate({
      ...data,
      sectionId: currentSectionId,
    });
    setAddToolDialogOpen(false);
  };

  const handleCreateText = (data: { name: string; icon: string; subType: string }) => {
    createTextDisplay.mutate({
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

  // Find the first non-default section index for determining isFirstSection
  const firstRealSectionIndex = sections.findIndex(s => s.id !== "default");

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {sections.map((section, index) => {
              // For real sections, determine if first/last among real sections
              const realSections = sections.filter(s => s.id !== "default");
              const realIndex = realSections.findIndex(s => s.id === section.id);
              const isFirstRealSection = realIndex === 0;
              const isLastRealSection = realIndex === realSections.length - 1;

              return (
                <MenuItemSection
                  key={section.id}
                  section={section}
                  isAdmin={isAdmin}
                  isFirstSection={section.id === "default" || isFirstRealSection}
                  isLastSection={section.id === "default" || isLastRealSection}
                  totalSections={sections.length}
                  onTitleChange={(sectionId, newTitle) => 
                    updateItemName.mutate({ itemId: sectionId, name: newTitle })
                  }
                  onAddSubmenu={handleAddSubmenu}
                  onAddFileDirectory={handleAddFileDirectory}
                  onAddTool={handleAddTool}
                  onAddText={handleAddText}
                  onAddSection={() => handleAddSection(section.id)}
                  onDeleteSection={(sectionId) => deleteItem.mutate(sectionId)}
                  onDeleteItem={(itemId) => deleteItem.mutate(itemId)}
                  onEditItem={(itemId, name) => {
                    updateItemName.mutate({ itemId, name });
                    // Find item to check if it's a text_display for auto-sync
                    const item = section.items.find(i => i.id === itemId);
                    if (item?.item_type === "text_display") {
                      driveExport.syncToDriveIfNeeded("text_display", itemId);
                    }
                  }}
                  onMoveUp={(sectionId) => moveSectionUp.mutate(sectionId)}
                  onMoveDown={(sectionId) => moveSectionDown.mutate(sectionId)}
                  onMoveItemUp={(itemId, sectionId) => moveItemUp.mutate({ itemId, sectionId })}
                  onMoveItemDown={(itemId, sectionId) => moveItemDown.mutate({ itemId, sectionId })}
                  onItemClick={onItemClick}
                  driveExport={driveExport}
                />
              );
            })}

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

      <AddFileDirectoryDialog
        open={addFileDirectoryDialogOpen}
        onOpenChange={setAddFileDirectoryDialogOpen}
        onSubmit={handleCreateFileDirectory}
        isPending={createFileDirectory.isPending}
      />

      <AddToolDialog
        open={addToolDialogOpen}
        onOpenChange={setAddToolDialogOpen}
        onSubmit={handleCreateTool}
        isPending={createTool.isPending}
      />

      <AddTextDialog
        open={addTextDialogOpen}
        onOpenChange={setAddTextDialogOpen}
        onSubmit={handleCreateText}
        isPending={createTextDisplay.isPending}
      />
    </>
  );
}