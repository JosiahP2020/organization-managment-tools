import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import type { CardStyle } from "@/hooks/useOrganizationSettings";

interface SortableMenuCardProps {
  category: DashboardCategory;
  cardStyle: CardStyle;
  onClick: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}

export function SortableMenuCard({
  category,
  cardStyle,
  onClick,
  onDelete,
  isAdmin,
}: SortableMenuCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const CardComponent = cardStyle === 'stat-card' 
    ? StatCard 
    : cardStyle === 'clean-minimal' 
    ? CleanMinimalCard 
    : LeftAccentCard;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group relative"
      >
        {/* Admin controls - visible on hover */}
        {isAdmin && (
          <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <CardComponent
          category={category}
          onClick={onClick}
          showEditButton={false}
        />
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        title="Delete Menu Card"
        description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
      />
    </>
  );
}
