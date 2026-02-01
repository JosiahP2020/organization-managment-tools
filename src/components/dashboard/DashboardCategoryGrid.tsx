import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardCategories } from "@/hooks/useDashboardCategories";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { AddMenuCardDialog } from "./AddMenuCardDialog";
import { WidgetColumn, SidebarWidgets } from "./WidgetPlaceholder";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardCategoryGrid() {
  const { categories, isLoading } = useDashboardCategories();
  const { cardStyle, dashboardLayout } = useOrganizationSettings();
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get the right card component based on style
  const CardComponent = cardStyle === 'stat-card' 
    ? StatCard 
    : cardStyle === 'clean-minimal' 
    ? CleanMinimalCard 
    : LeftAccentCard;

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
    // Navigate to the menu detail page using the category ID
    navigate(`${basePath}/menu/${category.id}`);
  };

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

  // Render cards based on selected layout
  const renderCards = () => (
    <>
      {categories.map((category) => (
        <CardComponent
          key={category.id}
          category={category}
          onClick={() => handleCategoryClick(category)}
          showEditButton={false}
        />
      ))}
        {isAdmin && (
          <div className="flex h-16 md:h-20 items-center justify-center">
            <AddMenuCardButton onAddMenu={() => setIsAddDialogOpen(true)} />
          </div>
        )}
    </>
  );

  // Full Width Layout - Single column, stacked cards
  if (dashboardLayout === 'full-width') {
    return (
      <>
        <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto">
          {renderCards()}
        </div>
        <AddMenuCardDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </>
    );
  }

  // Sidebar Left Layout - Navigation sidebar with grid
  if (dashboardLayout === 'sidebar-left') {
    return (
      <>
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <SidebarWidgets />
          </aside>
          
          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start">
            {renderCards()}
          </div>
        </div>
        
        {/* Mobile widgets below grid */}
        <div className="md:hidden mt-6">
          <SidebarWidgets />
        </div>
        
        <AddMenuCardDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </>
    );
  }

  // Masonry Layout - Pinterest-style varied heights
  if (dashboardLayout === 'masonry') {
    return (
      <>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="break-inside-avoid"
              style={{ 
                // Vary heights for masonry effect
                paddingBottom: index % 3 === 0 ? '1rem' : index % 3 === 1 ? '0.5rem' : '0' 
              }}
            >
              <CardComponent
                category={category}
                onClick={() => handleCategoryClick(category)}
                showEditButton={false}
              />
            </div>
          ))}
          {isAdmin && (
            <div className="break-inside-avoid flex h-20 md:h-24 items-center justify-center">
              <AddMenuCardButton onAddMenu={() => setIsAddDialogOpen(true)} />
            </div>
          )}
        </div>
        <AddMenuCardDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </>
    );
  }

  // Grid + Right Column Layout (default) - Grid with right widget column
  return (
    <>
      <div className="flex gap-6 items-start">
        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start">
          {renderCards()}
        </div>
        
        {/* Right Widget Column - Hidden on mobile */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <WidgetColumn />
        </aside>
      </div>
      
      {/* Mobile widgets below grid */}
      <div className="lg:hidden mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WidgetColumn />
        </div>
      </div>
      
      <AddMenuCardDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
