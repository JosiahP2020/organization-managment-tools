import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Pencil } from "lucide-react";
import { QuickCategoryDialog } from "@/components/dashboard/QuickCategoryDialog";
import type { MenuCategory } from "@/hooks/useMenuCategories";

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
  onUpdate: (input: { id: string; name?: string; description?: string | null; icon?: string; show_on_dashboard?: boolean; show_in_sidebar?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function EditableCategoryHeader({ category, isAdmin, onUpdate, onDelete }: EditableCategoryHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Convert category to MenuCategory type for dialog
  const categoryForDialog: MenuCategory = {
    id: category.id,
    organization_id: "",
    name: category.name,
    icon: category.icon,
    description: category.description,
    show_on_dashboard: category.show_on_dashboard ?? true,
    show_in_sidebar: category.show_in_sidebar ?? true,
    sort_order: 0,
    parent_category_id: null,
    created_by: "",
    created_at: "",
    updated_at: "",
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6 group">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
          <DynamicIcon name={category.icon} className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {category.name}
            </h1>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <QuickCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        category={categoryForDialog}
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
