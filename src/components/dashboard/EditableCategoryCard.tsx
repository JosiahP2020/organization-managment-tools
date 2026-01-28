import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil, ChevronRight } from "lucide-react";
import { QuickCategoryDialog } from "./QuickCategoryDialog";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";

interface EditableCategoryCardProps {
  category: DashboardCategory;
  onUpdate: (input: { id: string; name?: string; description?: string | null; icon?: string; show_on_dashboard?: boolean; show_in_sidebar?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function EditableCategoryCard({ category, onUpdate, onDelete }: EditableCategoryCardProps) {
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  const { isEditMode } = useEditMode();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleClick = () => {
    if (!organization?.slug) return;
    
    const basePath = `/dashboard/${organization.slug}`;
    const slug = category.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
    
    // Map common category names to existing routes
    if (slug === "shop-and-install" || slug === "shop-install") {
      navigate(`${basePath}/shop-install`);
      return;
    }
    if (slug === "sop" || slug === "training" || slug === "standard-operating-procedures") {
      navigate(`${basePath}/training`);
      return;
    }
    
    // For custom categories, use a generic category route
    navigate(`${basePath}/category/${category.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  // Show edit button only in edit mode for admins
  const showEditButton = isAdmin && isEditMode;

  return (
    <>
      {/* Left Accent Bar Card Style with Description and Arrow */}
      <Card 
        className="group relative overflow-hidden border border-border/50 rounded-xl hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer bg-card"
        onClick={handleClick}
      >
        {/* Left Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />

        {/* Edit button - visible only in edit mode for admins */}
        {showEditButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 z-10 bg-background/80 hover:bg-background shadow-sm"
            onClick={handleEditClick}
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

      {/* Edit Dialog */}
      <QuickCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        category={category}
        onSave={(data) => {
          onUpdate({ id: category.id, ...data });
          setShowEditDialog(false);
        }}
        onDelete={() => {
          onDelete(category.id);
          setShowEditDialog(false);
        }}
      />
    </>
  );
}
