import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Pencil } from "lucide-react";
import { QuickCategoryDialog } from "@/components/dashboard/QuickCategoryDialog";
import { useEditMode } from "@/contexts/EditModeContext";
import type { MenuCategory } from "@/hooks/useMenuCategories";

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

interface EditableSubcategoryCardProps {
  subcategory: Subcategory;
  isAdmin: boolean;
  onClick: () => void;
  onUpdate: (input: { id: string; name?: string; description?: string | null; icon?: string }) => void;
  onDelete: (id: string) => void;
}

export function EditableSubcategoryCard({ 
  subcategory, 
  isAdmin, 
  onClick, 
  onUpdate, 
  onDelete 
}: EditableSubcategoryCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { isEditMode } = useEditMode();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  // Show edit button only in edit mode for admins
  const showEditButton = isAdmin && isEditMode;

  // Convert to MenuCategory for dialog
  const categoryForDialog: MenuCategory = {
    id: subcategory.id,
    organization_id: "",
    name: subcategory.name,
    icon: subcategory.icon,
    description: subcategory.description,
    show_on_dashboard: true,
    show_in_sidebar: true,
    sort_order: 0,
    parent_category_id: null,
    created_by: "",
    created_at: "",
    updated_at: "",
  };

  return (
    <>
      <Card
        className="group relative cursor-pointer shadow-sm border border-border/50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-200"
        onClick={onClick}
      >
        {/* Edit button - visible only in edit mode for admins */}
        {showEditButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 z-10 bg-background/80 hover:bg-background shadow-sm"
            onClick={handleEditClick}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}

        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <DynamicIcon name={subcategory.icon} className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{subcategory.name}</h3>
          {subcategory.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {subcategory.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <QuickCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        category={categoryForDialog}
        onSave={(data) => {
          onUpdate({ id: subcategory.id, ...data });
          setShowEditDialog(false);
        }}
        onDelete={() => {
          onDelete(subcategory.id);
          setShowEditDialog(false);
        }}
      />
    </>
  );
}
