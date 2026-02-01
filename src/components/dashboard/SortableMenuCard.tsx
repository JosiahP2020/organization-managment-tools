import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import type { CardStyle } from "@/hooks/useOrganizationSettings";

interface SortableMenuCardProps {
  category: DashboardCategory;
  cardStyle: CardStyle;
  sectionId: string;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isAdmin: boolean;
}

export function SortableMenuCard({
  category,
  cardStyle,
  sectionId,
  isFirst,
  isLast,
  onClick,
  onDelete,
  onMoveUp,
  onMoveDown,
  isAdmin,
}: SortableMenuCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const CardComponent = cardStyle === 'stat-card' 
    ? StatCard 
    : cardStyle === 'clean-minimal' 
    ? CleanMinimalCard 
    : LeftAccentCard;

  return (
    <>
      <div className="group relative">
        {/* Admin controls - visible on hover */}
        {isAdmin && (
          <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isFirst && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {!isLast && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
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
