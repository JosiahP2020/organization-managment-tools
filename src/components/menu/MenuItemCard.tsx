import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import type { MenuItem } from "@/hooks/useMenuItems";

interface MenuItemCardProps {
  item: MenuItem;
  sectionId: string;
  isAdmin: boolean;
  onDelete: () => void;
  onEdit: (name: string) => void;
  onClick?: () => void;
}

export function MenuItemCard({ 
  item, 
  sectionId, 
  isAdmin, 
  onDelete,
  onEdit,
  onClick,
}: MenuItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
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

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== item.name) {
      onEdit(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group relative flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
        onClick={isEditing ? undefined : onClick}
      >
        {/* Icon - always on far left */}
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
          <DynamicIcon name={item.icon} className="h-4 w-4 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <h3 className="font-medium text-foreground truncate">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
              )}
            </>
          )}
        </div>

        {/* Admin controls - grouped on the right */}
        {isAdmin && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              ref={setActivatorNodeRef}
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
