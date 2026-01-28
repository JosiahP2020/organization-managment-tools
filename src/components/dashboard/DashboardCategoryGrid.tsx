import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardCategories } from "@/hooks/useDashboardCategories";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { EditableCategoryCard } from "./EditableCategoryCard";
import { AddCategoryCard } from "./AddCategoryCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { FolderOpen } from "lucide-react";

export function DashboardCategoryGrid() {
  const { categories, isLoading } = useDashboardCategories();
  const { isAdmin } = useAuth();
  const { isEditMode } = useEditMode();
  const { createCategory, updateCategory, deleteCategory } = useMenuCategories();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <Skeleton className="h-20 md:h-24 rounded-xl" />
        <Skeleton className="h-20 md:h-24 rounded-xl" />
      </div>
    );
  }

  const handleCreate = (data: { name: string; description?: string; icon: string; show_on_dashboard: boolean; show_in_sidebar: boolean }) => {
    createCategory.mutate({
      name: data.name,
      description: data.description,
      icon: data.icon,
      show_on_dashboard: data.show_on_dashboard,
      show_in_sidebar: data.show_in_sidebar,
    });
  };

  const handleUpdate = (input: { id: string; name?: string; description?: string | null; icon?: string; show_on_dashboard?: boolean; show_in_sidebar?: boolean }) => {
    updateCategory.mutate(input);
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  // Empty state for admins - show message and add card in edit mode
  if (categories.length === 0 && isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Categories Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isEditMode ? "Add your first category below" : "Enter Edit Mode to add categories"}
          </p>
        </div>
        {isEditMode && (
          <div className="max-w-md mx-auto">
            <AddCategoryCard onCreate={handleCreate} />
          </div>
        )}
      </div>
    );
  }

  // Empty state for employees
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No Categories Available</h3>
        <p className="text-sm text-muted-foreground">
          Your organization hasn't set up any categories yet.
        </p>
      </div>
    );
  }

  // Render category grid with new card style (stacked list on mobile, 2-col on desktop)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {categories.map((category) => (
        <EditableCategoryCard
          key={category.id}
          category={category}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
      {/* Add card for admins - only shows in edit mode */}
      {isAdmin && <AddCategoryCard onCreate={handleCreate} />}
    </div>
  );
}
