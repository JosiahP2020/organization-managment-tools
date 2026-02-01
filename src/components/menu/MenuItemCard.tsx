import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import type { MenuItem } from "@/hooks/useMenuItems";

interface MenuItemCardProps {
  item: MenuItem;
  sectionId: string;
  isAdmin: boolean;
  onDelete: () => void;
  onClick?: () => void;
}

export function MenuItemCard({ 
  item, 
  sectionId, 
  isAdmin, 
  onDelete,
  onClick,
}: MenuItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "menu-item",
      sectionId,
      item,
    },
    disabled: !isAdmin,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group relative flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        {/* Drag handle - admin only */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
          <DynamicIcon name={item.icon} className="h-4 w-4 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
          )}
        </div>

        {/* Delete button - admin only */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        title="Delete Submenu"
        description={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
      />
    </>
  );
}
