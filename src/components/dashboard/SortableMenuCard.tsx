import { Check } from "lucide-react";
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
  onClick,
  isAdmin,
}: SortableMenuCardProps) {
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
    <div
      className={cn(
        "relative rounded-lg transition-all",
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

      <CardComponent
        category={category}
        onClick={active ? () => {} : onClick}
        showEditButton={false}
      />
    </div>
  );
}
