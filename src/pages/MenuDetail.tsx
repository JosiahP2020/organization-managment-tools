import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MenuItemsColumn } from "@/components/menu/MenuItemsColumn";
import { toast } from "sonner";

const MenuDetail = () => {
  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl, logoFilterClass } = useThemeLogos();
  const queryClient = useQueryClient();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // Fetch the menu category details
  const { data: category, isLoading } = useQuery({
    queryKey: ["menu-category", menuId],
    queryFn: async () => {
      if (!menuId) return null;
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("id", menuId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!menuId && !!organization?.id,
  });

  // Update menu name mutation
  const updateMenuName = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("menu_categories")
        .update({ name })
        .eq("id", menuId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-category", menuId] });
      toast.success("Menu name updated");
    },
    onError: () => {
      toast.error("Failed to update menu name");
    },
  });

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== category?.name) {
      updateMenuName.mutate(editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditTitle(category?.name || "");
      setIsEditingTitle(false);
    }
  };

  const handleStartEditTitle = () => {
    if (isAdmin) {
      setEditTitle(category?.name || "");
      setIsEditingTitle(true);
    }
  };

  // Create linked category for legacy submenus
  const createLinkedCategory = useMutation({
    mutationFn: async (item: any) => {
      if (!organization?.id) throw new Error("No organization");

      // Create a new menu_category for this submenu (hidden from dashboard/sidebar)
      const { data: newCategory, error: categoryError } = await supabase
        .from("menu_categories")
        .insert({
          name: item.name,
          description: item.description || null,
          icon: item.icon || "folder",
          organization_id: organization.id,
          created_by: item.created_by,
          show_on_dashboard: false,
          show_in_sidebar: false,
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      // Update the menu_item to link to the new category
      const { error: updateError } = await supabase
        .from("menu_items")
        .update({ target_category_id: newCategory.id })
        .eq("id", item.id);

      if (updateError) throw updateError;

      return newCategory;
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", menuId] });
      navigate(`/dashboard/${slug}/menu/${newCategory.id}`);
    },
    onError: () => {
      toast.error("Failed to open submenu");
    },
  });

  // Handle submenu click - navigate to that submenu's linked category
  const handleSubmenuClick = (item: any) => {
    if (item.target_category_id) {
      // Navigate to existing linked category
      navigate(`/dashboard/${slug}/menu/${item.target_category_id}`);
    } else {
      // Create linked category on-the-fly for legacy submenus
      createLinkedCategory.mutate(item);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-center mb-6 md:mb-8">
            <Skeleton className="h-32 w-48" />
          </div>
          <Skeleton className="h-10 w-64 mx-auto mb-8" />
          <Skeleton className="h-16 w-full mb-2" />
          <Skeleton className="h-16 w-full mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4">
        {/* Organization Logo - Centered */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            filterClass={logoFilterClass}
            className="max-h-32 md:max-h-40"
          />
        </div>

        {/* Menu Title - Centered and Editable */}
        <div className="text-center mb-8">
          {isEditingTitle ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-2xl md:text-3xl font-bold text-center max-w-md mx-auto"
            />
          ) : (
            <h1 
              className={`text-2xl md:text-3xl font-bold text-foreground ${isAdmin ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
              onClick={handleStartEditTitle}
            >
              {category?.name || "Menu"}
            </h1>
          )}
          {category?.description && !isEditingTitle && (
            <p className="text-muted-foreground mt-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Menu Items Column */}
        {menuId && (
          <MenuItemsColumn 
            categoryId={menuId} 
            onItemClick={handleSubmenuClick}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenuDetail;
