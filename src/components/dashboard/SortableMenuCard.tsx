import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import type { CardStyle } from "@/hooks/useOrganizationSettings";
import { useSelectableItem } from "@/components/selection";
import { cn } from "@/lib/utils";

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

  const { selected, active, longPressHandlers, handleClick } = useSelectableItem({
    surface: "dashboard:categories",
    id: category.id,
    meta: { label: category.name, type: "dashboard_category", parentId: sectionId },
    enabled: isAdmin,
  });

  const CardComponent = cardStyle === 'stat-card' 
    ? StatCard 
    : cardStyle === 'clean-minimal' 
    ? CleanMinimalCard 
    : LeftAccentCard;

  return (
    <>
      <div
        className={cn(
          "group relative transition-all rounded-xl",
          selected && "ring-2 ring-primary"
        )}
        {...longPressHandlers}
        onClick={handleClick()}
      >
        {selected && (
          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow z-30">
            <Check className="h-3 w-3" />
          </div>
        )}

        {/* Admin controls - hidden in select mode */}
        {isAdmin && !active && (
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
