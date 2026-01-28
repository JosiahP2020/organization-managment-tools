import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Pencil } from "lucide-react";
import { QuickCategoryDialog } from "@/components/dashboard/QuickCategoryDialog";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import sccLogo from "@/assets/scc-logo.gif";

interface EditableCategoryHeaderProps {
  category: {
    id: string;
    name: string;
    icon: string;
    description: string | null;
    show_on_dashboard?: boolean;
    show_in_sidebar?: boolean;
  };
  isAdmin: boolean;
  showIcon?: boolean;
  onUpdate: (input: { id: string; name?: string; description?: string | null; icon?: string; show_on_dashboard?: boolean; show_in_sidebar?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function EditableCategoryHeader({ 
  category, 
  isAdmin, 
  showIcon = false,
  onUpdate, 
  onDelete 
}: EditableCategoryHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { mainLogoUrl, logoFilterClass } = useThemeLogos();
  const { organization } = useAuth();
  const { isEditMode } = useEditMode();

  // Use main logo, fall back to default
  const displayLogo = mainLogoUrl || sccLogo;

  // Show edit button only in edit mode for admins
  const showEditButton = isAdmin && isEditMode;

  return (
    <>
      {/* Centered Main Logo */}
      <div className="flex justify-center mb-6">
        <img
          src={displayLogo}
          alt={organization?.name || "Organization"}
          className={`h-36 w-auto max-h-32 md:max-h-40 object-contain ${logoFilterClass}`}
        />
      </div>

      {/* Category Title - Centered */}
      <div className="text-center mb-8 group">
        <div className="flex items-center justify-center gap-2">
          {showIcon && category.icon && (
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <DynamicIcon name={category.icon} className="h-5 w-5 text-primary" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {category.name}
          </h1>
          {showEditButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{category.description}</p>
        )}
      </div>

      {/* Edit Dialog */}
      <QuickCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        category={{
          id: category.id,
          name: category.name,
          icon: category.icon,
          description: category.description,
          show_on_dashboard: category.show_on_dashboard ?? true,
          show_in_sidebar: category.show_in_sidebar ?? true,
        }}
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