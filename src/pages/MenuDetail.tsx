import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const MenuDetail = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const { organization } = useAuth();
  const { mainLogoUrl, logoFilterClass } = useThemeLogos();

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 md:mb-8">
            <Skeleton className="h-32 w-48" />
          </div>
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
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

        {/* Menu Title - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {category?.name || "Menu"}
          </h1>
          {category?.description && (
            <p className="text-muted-foreground mt-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Menu content will go here */}
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <p className="text-muted-foreground">
            Menu items will be displayed here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MenuDetail;
