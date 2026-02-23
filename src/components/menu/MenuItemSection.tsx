import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { EditableSectionTitle } from "@/components/dashboard/EditableSectionTitle";
import { AddMenuItemButton } from "./AddMenuItemButton";
import { MenuItemCard } from "./MenuItemCard";
import { FileDirectoryCard } from "./FileDirectoryCard";
import { ToolCard } from "./ToolCard";
import { TextDisplayCard } from "./TextDisplayCard";
import { ExportToDriveButton } from "./ExportToDriveButton";
import type { MenuItemSection as MenuItemSectionType } from "@/hooks/useMenuItems";

interface DriveExportContext {
  isConnected: boolean;
  getRef: (entityId: string) => { entity_id: string; last_synced_at: string; drive_file_id: string } | null;
  exportToDrive: (type: string, id: string) => Promise<void>;
  isExporting: (id: string) => boolean;
}

interface MenuItemSectionProps {
  section: MenuItemSectionType;
  isAdmin: boolean;
  isFirstSection: boolean;
  isLastSection: boolean;
  totalSections: number;
  onTitleChange: (sectionId: string, newTitle: string) => void;
  onAddSubmenu: (sectionId: string) => void;
  onAddFileDirectory: (sectionId: string) => void;
  onAddTool: (sectionId: string) => void;
  onAddText: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (itemId: string, name: string) => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
  onMoveItemUp: (itemId: string, sectionId: string) => void;
  onMoveItemDown: (itemId: string, sectionId: string) => void;
  onItemClick?: (item: any) => void;
  driveExport?: DriveExportContext;
}

export function MenuItemSection({
  section,
  isAdmin,
  isFirstSection,
  isLastSection,
  totalSections,
  onTitleChange,
  onAddSubmenu,
  onAddFileDirectory,
  onAddTool,
  onAddText,
  onAddSection,
  onDeleteSection,
  onDeleteItem,
  onEditItem,
  onMoveUp,
  onMoveDown,
  onMoveItemUp,
  onMoveItemDown,
  onItemClick,
  driveExport,
}: MenuItemSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Section droppable (for receiving items)
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
  // Show section titles for ALL sections when there are 2+ sections
  const showSectionTitle = totalSections > 1;

  return (
    <>
      <div className="mb-6 last:mb-0 group/section relative">
        {/* Section Header - only show if more than one section */}
        {showSectionTitle && (
          <div className="flex justify-center mb-3 relative">
            <EditableSectionTitle
              title={section.title}
              onTitleChange={(newTitle) => onTitleChange(section.id, newTitle)}
              isEditable={isAdmin}
            />

            {/* Admin controls for section - now on the right */}
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
        )}

        {/* Items list - droppable zone */}
        <div
          ref={setDroppableRef}
          className={`flex flex-col gap-2 min-h-[3rem] rounded-xl p-2 transition-colors ${
            isOver ? "bg-primary/10 ring-2 ring-primary/50" : ""
          }`}
        >
          {section.items.map((item, index) => {
            // Drive export for text_display items (tools export at document level)
            const driveType = item.item_type === "text_display" ? "text_display" : null;
            const driveRef = driveExport?.isConnected && driveType ? driveExport.getRef(item.id) : null;
            const showDriveExport = isAdmin && driveExport?.isConnected && driveType;

            const driveButton = showDriveExport ? (
              <ExportToDriveButton
                entityId={item.id}
                entityType={driveType!}
                isExporting={driveExport!.isExporting(item.id)}
                lastSynced={driveRef?.last_synced_at || null}
                onExport={() => driveExport!.exportToDrive(driveType!, item.id)}
              />
            ) : null;

            if (item.item_type === "file_directory") {
              return (
                <FileDirectoryCard
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === section.items.length - 1}
                  onMoveUp={() => onMoveItemUp(item.id, section.id)}
                  onMoveDown={() => onMoveItemDown(item.id, section.id)}
                  onDelete={() => onDeleteItem(item.id)}
                  onTitleChange={(newTitle) => onEditItem(item.id, newTitle)}
                />
              );
            }
            
            if (item.item_type === "tool") {
              return (
                <ToolCard
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === section.items.length - 1}
                  onMoveUp={() => onMoveItemUp(item.id, section.id)}
                  onMoveDown={() => onMoveItemDown(item.id, section.id)}
                  onDelete={() => onDeleteItem(item.id)}
                  onTitleChange={(newTitle) => onEditItem(item.id, newTitle)}
                  onClick={() => onItemClick?.(item)}
                  driveButton={driveButton}
                />
              );
            }

            if (item.item_type === "text_display") {
              return (
                <TextDisplayCard
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === section.items.length - 1}
                  onMoveUp={() => onMoveItemUp(item.id, section.id)}
                  onMoveDown={() => onMoveItemDown(item.id, section.id)}
                  onDelete={() => onDeleteItem(item.id)}
                  onTitleChange={(newTitle) => onEditItem(item.id, newTitle)}
                  driveButton={driveButton}
                />
              );
            }
            
            return (
              <MenuItemCard
                key={item.id}
                item={item}
                sectionId={section.id}
                isAdmin={isAdmin}
                isFirst={index === 0}
                isLast={index === section.items.length - 1}
                onDelete={() => onDeleteItem(item.id)}
                onEdit={(name) => onEditItem(item.id, name)}
                onMoveUp={() => onMoveItemUp(item.id, section.id)}
                onMoveDown={() => onMoveItemDown(item.id, section.id)}
                onClick={() => onItemClick?.(item)}
              />
            );
          })}

          {/* Add button */}
          {isAdmin && (
            <div className="flex justify-center py-2">
              <AddMenuItemButton
                onAddSubmenu={() => onAddSubmenu(section.id)}
                onAddFileDirectory={() => onAddFileDirectory(section.id)}
                onAddTool={() => onAddTool(section.id)}
                onAddText={() => onAddText(section.id)}
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