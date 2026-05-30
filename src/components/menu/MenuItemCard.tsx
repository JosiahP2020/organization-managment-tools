import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, ChevronUp, ChevronDown, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { useSelectableItem } from "@/components/selection";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/hooks/useMenuItems";

interface MenuItemCardProps {
  item: MenuItem;
  sectionId: string;
  surface: string;
  isAdmin: boolean;
  isFirst: boolean;
  isLast: boolean;
  onDelete: () => void;
  onEdit: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClick?: () => void;
}

export function MenuItemCard({
  item,
  sectionId,
  surface,
  isAdmin,
  isFirst,
  isLast,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onClick,
}: MenuItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const { selected, active, longPressHandlers, handleClick } = useSelectableItem({
    surface,
    id: item.id,
    meta: { label: item.name, type: item.item_type, parentId: sectionId, payload: item },
    enabled: isAdmin && !isEditing,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: "menu-item", sectionId, item },
    disabled: !isAdmin || active,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== item.name) onEdit(editName.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
    else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex items-center gap-3 p-3 rounded-lg bg-card border transition-colors cursor-pointer",
          selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
        )}
        onClick={isEditing ? undefined : handleClick(onClick)}
        {...(active ? longPressHandlers : longPressHandlers)}
      >
        {/* Selection check badge */}
        {selected && (
          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
            <Check className="h-3 w-3" />
          </div>
        )}

        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
          <DynamicIcon name={item.icon} className="h-5 w-5 text-primary" />
        </div>

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

        {/* Admin controls — hidden in select mode */}
        {isAdmin && !isEditing && !active && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!isFirst && (
              <Button variant="ghost" size="icon" className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }} title="Move up">
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {!isLast && (
              <Button variant="ghost" size="icon" className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }} title="Move down">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => { onDelete(); setShowDeleteDialog(false); }}
        title="Delete Submenu"
        description={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
      />
    </>
  );
}
