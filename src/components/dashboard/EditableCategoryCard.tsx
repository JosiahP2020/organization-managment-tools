import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil } from "lucide-react";
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

  return (
    <>
      <Card 
        className="group relative overflow-hidden shadow-sm border border-border/50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-card"
        onClick={handleClick}
      >
        {/* Edit button - visible on hover for admins */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 hover:bg-background shadow-sm"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
            <DynamicIcon name={category.icon} className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
        </CardContent>
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
