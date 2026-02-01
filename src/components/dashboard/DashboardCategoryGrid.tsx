import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSections } from "@/hooks/useDashboardSections";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { AddMenuCardDialog } from "./AddMenuCardDialog";
import { WidgetColumn, SidebarWidgets, WidgetGrid } from "./WidgetPlaceholder";
import { EditableSectionTitle } from "./EditableSectionTitle";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCategory } from "@/hooks/useDashboardCategories";

export function DashboardCategoryGrid() {
  const { sections, isLoading, createSection, updateSectionTitle } = useDashboardSections();
  const { cardStyle, dashboardLayout } = useOrganizationSettings();
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addToSectionId, setAddToSectionId] = useState<string | null>(null);

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

  const handleAddMenu = (sectionId: string) => {
    setAddToSectionId(sectionId);
    setIsAddDialogOpen(true);
  };

  const handleAddSection = () => {
    createSection.mutate("New Section");
  };

  const handleTitleChange = (sectionId: string, newTitle: string) => {
    updateSectionTitle.mutate({ sectionId, title: newTitle });
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

  // Empty state - no sections and no categories
  const totalCategories = sections.reduce((sum, s) => sum + s.categories.length, 0);
  if (sections.length === 0 && totalCategories === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No Categories Available</h3>
        <p className="text-sm text-muted-foreground">
          Your organization hasn't set up any categories yet.
        </p>
        {isAdmin && (
          <div className="mt-4">
            <AddMenuCardButton 
              onAddMenu={() => handleAddMenu("default")}
              onAddSection={handleAddSection}
            />
          </div>
        )}
      </div>
    );
  }

  // Render a single section
  const renderSection = (section: typeof sections[0], isLast: boolean) => (
    <div key={section.id} className="mb-8 last:mb-0">
      {/* Section Title */}
      <div className="flex justify-center mb-4">
        <EditableSectionTitle
          title={section.title}
          onTitleChange={(newTitle) => handleTitleChange(section.id, newTitle)}
          isEditable={isAdmin}
        />
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start">
        {section.categories.map((category) => (
          <CardComponent
            key={category.id}
            category={category}
            onClick={() => handleCategoryClick(category)}
            showEditButton={false}
          />
        ))}
        
        {/* Add button - only show Section option on the last section */}
        {isAdmin && (
          <div className="flex h-16 md:h-20 items-center justify-center">
            <AddMenuCardButton 
              onAddMenu={() => handleAddMenu(section.id)}
              onAddSection={isLast ? handleAddSection : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Render all sections
  const renderSections = () => (
    <>
      {sections.map((section, index) => 
        renderSection(section, index === sections.length - 1)
      )}
    </>
  );

  // Full Width Layout
  if (dashboardLayout === 'full-width') {
    return (
      <>
        <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto">
          {renderSections()}
        </div>
        <AddMenuCardDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          sectionId={addToSectionId}
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
            {renderSections()}
          </div>
        </div>
        <div className="md:hidden mt-6">
          <SidebarWidgets />
        </div>
        <AddMenuCardDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          sectionId={addToSectionId}
        />
      </>
    );
  }

  // Masonry Layout
  if (dashboardLayout === 'masonry') {
    return (
      <>
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-8 last:mb-0">
            <div className="flex justify-center mb-4">
              <EditableSectionTitle
                title={section.title}
                onTitleChange={(newTitle) => handleTitleChange(section.id, newTitle)}
                isEditable={isAdmin}
              />
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
              {section.categories.map((category, index) => (
                <div 
                  key={category.id} 
                  className="break-inside-avoid"
                  style={{ 
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
                  <AddMenuCardButton 
                    onAddMenu={() => handleAddMenu(section.id)}
                    onAddSection={sectionIndex === sections.length - 1 ? handleAddSection : undefined}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <AddMenuCardDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          sectionId={addToSectionId}
        />
      </>
    );
  }

  // Grid + Right Column Layout (default)
  return (
    <>
      <div className="flex gap-6 items-start">
        <div className="flex-1">
          {renderSections()}
        </div>
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <WidgetColumn />
        </aside>
      </div>
      <div className="lg:hidden mt-6">
        <WidgetGrid />
      </div>
      <AddMenuCardDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        sectionId={addToSectionId}
      />
    </>
  );
}
