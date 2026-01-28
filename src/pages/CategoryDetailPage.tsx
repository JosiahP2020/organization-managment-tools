import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { FileText, FolderOpen } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  item_type: string;
  tool_type: string | null;
  target_category_id: string | null;
  sort_order: number;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

export default function CategoryDetailPage() {
  const { orgSlug, categoryId } = useParams<{ orgSlug: string; categoryId: string }>();
  const { organization } = useAuth();
  const navigate = useNavigate();

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
        } else if (item.tool_type === "gemba_doc") {
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!category) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-center py-12">
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
      <div className="max-w-5xl mx-auto">
        {/* Category Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <DynamicIcon name={category.icon} className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>

        {/* Content Grid */}
        {hasContent ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Subcategories */}
            {subcategories.map((subcategory) => (
              <Card
                key={subcategory.id}
                className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                onClick={() => handleSubcategoryClick(subcategory)}
              >
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
            ))}

            {/* Menu Items */}
            {items.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <DynamicIcon name={item.icon} className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {/* Type badge */}
                  <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {item.item_type === "file_directory" ? "Documents" : item.item_type}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No Items Yet</h3>
            <p className="text-sm text-muted-foreground">
              This category is empty. Add items in Menu Configuration.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
