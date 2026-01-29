import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardCategories } from "@/hooks/useDashboardCategories";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { AddMenuCardDialog } from "./AddMenuCardDialog";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardCategoryGrid() {
  const { categories, isLoading } = useDashboardCategories();
  const { cardStyle } = useOrganizationSettings();
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <Skeleton className="h-20 md:h-24 rounded-xl" />
        <Skeleton className="h-20 md:h-24 rounded-xl" />
      </div>
    );
  }

  // Empty state
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

  const handleCategoryClick = (category: typeof categories[0]) => {
    if (!organization?.slug) return;
    const basePath = `/dashboard/${organization.slug}`;
    const slug = category.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
    
    if (slug === "shop-and-install" || slug === "shop-install") {
      navigate(`${basePath}/shop-install`);
      return;
    }
    if (slug === "sop" || slug === "training" || slug === "standard-operating-procedures") {
      navigate(`${basePath}/training`);
      return;
    }
    // For other categories, we would navigate to a generic category page
    console.log("Navigate to category:", category.id);
  };

  // Get the right card component based on style
  const CardComponent = cardStyle === 'stat-card' 
    ? StatCard 
    : cardStyle === 'clean-minimal' 
    ? CleanMinimalCard 
    : LeftAccentCard;

  // Render category grid
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {categories.map((category) => (
          <CardComponent
            key={category.id}
            category={category}
            onClick={() => handleCategoryClick(category)}
            showEditButton={false}
          />
        ))}
        {isAdmin && (
          <div className="flex h-20 md:h-24 items-center justify-center">
            <AddMenuCardButton onAddMenu={() => setIsAddDialogOpen(true)} />
          </div>
        )}
      </div>
      
      <AddMenuCardDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </>
  );
}