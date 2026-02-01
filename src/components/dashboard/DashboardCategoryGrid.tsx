import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSections } from "@/hooks/useDashboardSections";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { AddMenuCardDialog } from "./AddMenuCardDialog";
import { AddSectionDialog } from "./AddSectionDialog";
import { DashboardSection } from "./DashboardSection";
import { WidgetColumn, SidebarWidgets, WidgetGrid } from "./WidgetPlaceholder";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";

export function DashboardCategoryGrid() {
  const { sectionsWithCategories, unsortedCategories, isLoading } = useDashboardSections();
  const { cardStyle, dashboardLayout } = useOrganizationSettings();
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  const [isAddMenuDialogOpen, setIsAddMenuDialogOpen] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Get the right card component based on style
  const CardComponent = cardStyle === 'stat-card' 
    ? StatCard 
    : cardStyle === 'clean-minimal' 
    ? CleanMinimalCard 
    : LeftAccentCard;

  const handleCategoryClick = (category: DashboardCategory) => {
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
    navigate(`${basePath}/menu/${category.id}`);
  };

  const handleAddMenuToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsAddMenuDialogOpen(true);
  };

  const handleAddMenuUnsorted = () => {
    setSelectedSectionId(null);
    setIsAddMenuDialogOpen(true);
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

  const hasSections = sectionsWithCategories.length > 0;
  const hasContent = hasSections || unsortedCategories.length > 0;

  // Empty state
  if (!hasContent) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No Categories Available</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your organization hasn't set up any categories yet.
        </p>
        {isAdmin && (
          <div className="flex justify-center">
            <AddMenuCardButton 
              onAddMenu={handleAddMenuUnsorted} 
              onAddSection={() => setIsAddSectionDialogOpen(true)}
              showSectionOption={true}
            />
          </div>
        )}
        <AddMenuCardDialog 
          open={isAddMenuDialogOpen} 
          onOpenChange={setIsAddMenuDialogOpen} 
          sectionId={selectedSectionId}
        />
        <AddSectionDialog 
          open={isAddSectionDialogOpen} 
          onOpenChange={setIsAddSectionDialogOpen} 
        />
      </div>
    );
  }

  // Render sections and unsorted categories
  const renderContent = () => (
    <div className="space-y-6">
      {/* Unsorted categories (no section) */}
      {unsortedCategories.length > 0 && (
        <div className="space-y-3">
          {hasSections && (
            <h2 className="text-lg font-semibold text-foreground">Main</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start">
            {unsortedCategories.map((category) => (
              <CardComponent
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category)}
                showEditButton={false}
              />
            ))}
            {isAdmin && (
              <div className="flex h-16 md:h-20 items-center justify-center">
                <AddMenuCardButton 
                  onAddMenu={handleAddMenuUnsorted}
                  onAddSection={() => setIsAddSectionDialogOpen(true)}
                  showSectionOption={true}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sections with their categories */}
      {sectionsWithCategories.map((section) => (
        <DashboardSection
          key={section.id}
          section={section}
          CardComponent={CardComponent}
          onCategoryClick={handleCategoryClick}
          onAddMenu={handleAddMenuToSection}
        />
      ))}

      {/* Add section button at the bottom if there are sections or no unsorted categories */}
      {isAdmin && (hasSections || unsortedCategories.length === 0) && (
        <div className="flex justify-start pt-2">
          <AddMenuCardButton 
            onAddMenu={handleAddMenuUnsorted}
            onAddSection={() => setIsAddSectionDialogOpen(true)}
            showSectionOption={true}
          />
        </div>
      )}
    </div>
  );

  // Full Width Layout
  if (dashboardLayout === 'full-width') {
    return (
      <>
        <div className="max-w-2xl mx-auto">
          {renderContent()}
        </div>
        <AddMenuCardDialog 
          open={isAddMenuDialogOpen} 
          onOpenChange={setIsAddMenuDialogOpen} 
          sectionId={selectedSectionId}
        />
        <AddSectionDialog 
          open={isAddSectionDialogOpen} 
          onOpenChange={setIsAddSectionDialogOpen} 
        />
      </>
    );
  }

  // Sidebar Left Layout
  if (dashboardLayout === 'sidebar-left') {
    return (
      <>
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <SidebarWidgets />
          </aside>
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
        <div className="md:hidden mt-6">
          <SidebarWidgets />
        </div>
        <AddMenuCardDialog 
          open={isAddMenuDialogOpen} 
          onOpenChange={setIsAddMenuDialogOpen} 
          sectionId={selectedSectionId}
        />
        <AddSectionDialog 
          open={isAddSectionDialogOpen} 
          onOpenChange={setIsAddSectionDialogOpen} 
        />
      </>
    );
  }

  // Masonry Layout
  if (dashboardLayout === 'masonry') {
    return (
      <>
        {renderContent()}
        <AddMenuCardDialog 
          open={isAddMenuDialogOpen} 
          onOpenChange={setIsAddMenuDialogOpen} 
          sectionId={selectedSectionId}
        />
        <AddSectionDialog 
          open={isAddSectionDialogOpen} 
          onOpenChange={setIsAddSectionDialogOpen} 
        />
      </>
    );
  }

  // Grid + Right Column Layout (default)
  return (
    <>
      <div className="flex gap-6 items-start">
        <div className="flex-1">
          {renderContent()}
        </div>
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <WidgetColumn />
        </aside>
      </div>
      <div className="lg:hidden mt-6">
        <WidgetGrid />
      </div>
      <AddMenuCardDialog 
        open={isAddMenuDialogOpen} 
        onOpenChange={setIsAddMenuDialogOpen} 
        sectionId={selectedSectionId}
      />
      <AddSectionDialog 
        open={isAddSectionDialogOpen} 
        onOpenChange={setIsAddSectionDialogOpen} 
      />
    </>
  );
}
