import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Pencil, ChevronRight, ArrowRight } from "lucide-react";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";
import type { CardStyle } from "@/hooks/useOrganizationSettings";

interface CardVariantProps {
  category: DashboardCategory;
  onClick: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
  showEditButton: boolean;
}

// Style 1: Left Accent Bar (default)
export function LeftAccentCard({ category, onClick, onEditClick, showEditButton }: CardVariantProps) {
  return (
    <Card 
      className="group relative overflow-hidden border border-border/50 rounded-xl hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer bg-card"
      onClick={onClick}
    >
      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />

      {/* Edit button */}
      {showEditButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 z-10 bg-background/80 hover:bg-background shadow-sm"
          onClick={onEditClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center p-4 md:p-5 pl-5 md:pl-6">
        {/* Icon */}
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
          <DynamicIcon name={category.icon} className="w-6 h-6 md:w-7 md:h-7 text-primary" />
        </div>

        {/* Text Content */}
        <div className="flex-1 ml-4 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {category.description}
            </p>
          )}
        </div>

        {/* Right Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 ml-2 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </Card>
  );
}

// Style 2: Stat Card (centered, bigger icon)
export function StatCard({ category, onClick, onEditClick, showEditButton }: CardVariantProps) {
  return (
    <Card 
      className="group relative overflow-hidden border border-border/50 rounded-xl hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer bg-card"
      onClick={onClick}
    >
      {/* Edit button */}
      {showEditButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 z-10 bg-background/80 hover:bg-background shadow-sm"
          onClick={onEditClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <div className="flex flex-col items-center justify-center p-6 md:p-8 text-center">
        {/* Large Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
          <DynamicIcon name={category.icon} className="w-8 h-8 md:w-10 md:h-10 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold text-foreground">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2 max-w-xs">
            {category.description}
          </p>
        )}

        {/* Bottom Arrow */}
        <ArrowRight className="w-5 h-5 text-muted-foreground mt-4 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </Card>
  );
}

// Style 3: Clean Minimal
export function CleanMinimalCard({ category, onClick, onEditClick, showEditButton }: CardVariantProps) {
  return (
    <Card 
      className="group relative overflow-hidden border-0 rounded-xl hover:bg-accent/50 transition-all duration-200 cursor-pointer bg-transparent"
      onClick={onClick}
    >
      {/* Edit button */}
      {showEditButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 z-10 bg-background/80 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEditClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center p-4 md:p-5">
        {/* Simple Icon Container */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0">
          <DynamicIcon name={category.icon} className="w-5 h-5 md:w-6 md:h-6 text-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Text Content */}
        <div className="flex-1 ml-3 min-w-0">
          <h3 className="text-base md:text-lg font-medium text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
        </div>

        {/* Subtle Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 ml-2 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </Card>
  );
}

// Factory function to get the right card component
export function getCategoryCard(style: CardStyle) {
  switch (style) {
    case 'stat-card':
      return StatCard;
    case 'clean-minimal':
      return CleanMinimalCard;
    case 'left-accent':
    default:
      return LeftAccentCard;
  }
}
