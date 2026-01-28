import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { QuickCategoryDialog } from "./QuickCategoryDialog";
import { getCategoryCard } from "./CategoryCardVariants";
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
  const { cardStyle } = useOrganizationSettings();
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

  // Get the appropriate card component based on org settings
  const CardComponent = getCategoryCard(cardStyle);

  return (
    <>
      <CardComponent
        category={category}
        onClick={handleClick}
        onEditClick={handleEditClick}
        showEditButton={showEditButton}
      />

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
