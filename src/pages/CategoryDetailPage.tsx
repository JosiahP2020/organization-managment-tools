import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import type { MenuItem } from "@/hooks/useMenuItems";
import { EditableCategoryHeader } from "@/components/category/EditableCategoryHeader";
import { EditableSubcategoryCard } from "@/components/category/EditableSubcategoryCard";
import { EditableItemCard } from "@/components/category/EditableItemCard";
import { AddItemCard, ItemType } from "@/components/category/AddItemCard";
import { useState } from "react";
import { AddMenuItemDialog } from "@/components/menu-config/AddMenuItemDialog";
import { QuickCategoryDialog } from "@/components/dashboard/QuickCategoryDialog";

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  show_on_dashboard?: boolean;
  show_in_sidebar?: boolean;
}

export default function CategoryDetailPage() {
  const { orgSlug, categoryId } = useParams<{ orgSlug: string; categoryId: string }>();
  const { organization, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { updateCategory, deleteCategory, createCategory } = useMenuCategories();
  
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddSubcategoryDialog, setShowAddSubcategoryDialog] = useState(false);

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category-detail", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("id", categoryId)
        .maybeSingle();

      if (error) throw error;
      return data as MenuCategory | null;
    },
    enabled: !!categoryId,
  });

  // Fetch menu items for this category
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["category-items", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!categoryId,
  });

  // Fetch subcategories
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("parent_category_id", categoryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MenuCategory[];
    },
    enabled: !!categoryId,
  });

  const isLoading = categoryLoading || itemsLoading || subcategoriesLoading;

  const handleItemClick = (item: MenuItem) => {
    if (!organization?.slug) return;
    const basePath = `/dashboard/${organization.slug}`;

    switch (item.item_type) {
      case "submenu":
        if (item.target_category_id) {
          navigate(`${basePath}/category/${item.target_category_id}`);
        }
        break;
      case "file_directory":
        navigate(`${basePath}/category/${categoryId}/documents/${item.id}`);
        break;
      case "tool":
        // Handle tool navigation based on tool_type
        if (item.tool_type === "checklist") {
          navigate(`${basePath}/category/${categoryId}/tool/${item.id}/checklists`);
        } else if (item.tool_type === "sop_guide") {
          navigate(`${basePath}/category/${categoryId}/tool/${item.id}/guides`);
        }
        break;
      default:
        break;
    }
  };

  const handleSubcategoryClick = (subcategory: MenuCategory) => {
    if (!organization?.slug) return;
    navigate(`/dashboard/${organization.slug}/category/${subcategory.id}`);
  };

  const handleCategoryUpdate = (input: { id: string; name?: string; description?: string | null; icon?: string; show_on_dashboard?: boolean; show_in_sidebar?: boolean }) => {
    updateCategory.mutate(input);
  };

  const handleCategoryDelete = (id: string) => {
    deleteCategory.mutate(id);
    // Navigate back to dashboard after deleting
    if (organization?.slug) {
      navigate(`/dashboard/${organization.slug}`);
    }
  };

  const handleSubcategoryUpdate = (input: { id: string; name?: string; description?: string | null; icon?: string }) => {
    updateCategory.mutate(input);
  };

  const handleSubcategoryDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  const handleAddItem = (type: ItemType) => {
    if (type === "subcategory") {
      setShowAddSubcategoryDialog(true);
    } else {
      // For all other types (file_directory, checklist, sop_guide), open the item dialog
      setShowAddItemDialog(true);
    }
  };

  const handleCreateSubcategory = (data: { name: string; description?: string; icon: string }) => {
    createCategory.mutate({
      name: data.name,
      description: data.description,
      icon: data.icon,
      parent_category_id: categoryId,
      show_on_dashboard: false,
      show_in_sidebar: false,
    });
    setShowAddSubcategoryDialog(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Skeleton className="h-20 w-48" />
          </div>
          <Skeleton className="h-10 w-48 mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!category) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Category Not Found</h2>
          <p className="text-muted-foreground">
            This category doesn't exist or you don't have access to it.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const hasContent = items.length > 0 || subcategories.length > 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Editable Category Header with Logo */}
        <EditableCategoryHeader
          category={category}
          isAdmin={isAdmin}
          showIcon={false}
          onUpdate={handleCategoryUpdate}
          onDelete={handleCategoryDelete}
        />

        {/* Content Grid - Centered */}
        {hasContent || isAdmin ? (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-2xl">
              {/* Subcategories */}
              {subcategories.map((subcategory) => (
                <EditableSubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  isAdmin={isAdmin}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  onUpdate={handleSubcategoryUpdate}
                  onDelete={handleSubcategoryDelete}
                />
              ))}

              {/* Menu Items */}
              {items.map((item) => (
                <EditableItemCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>

            {/* Add Item Button for Admins - Subtle centered plus */}
            {isAdmin && (
              <div className="mt-6">
                <AddItemCard onAdd={handleAddItem} />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl max-w-md mx-auto">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No Items Yet</h3>
            <p className="text-sm text-muted-foreground">
              This category is empty.
            </p>
          </div>
        )}
      </div>

      {/* Add Item Dialog */}
      {categoryId && (
        <AddMenuItemDialog
          open={showAddItemDialog}
          onOpenChange={setShowAddItemDialog}
          categoryId={categoryId}
        />
      )}

      {/* Add Subcategory Dialog */}
      <QuickCategoryDialog
        open={showAddSubcategoryDialog}
        onOpenChange={setShowAddSubcategoryDialog}
        mode="create"
        onSave={handleCreateSubcategory}
      />
    </DashboardLayout>
  );
}