import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSections } from "@/hooks/useDashboardSections";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { AddMenuCardDialog } from "./AddMenuCardDialog";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { WidgetColumn, SidebarWidgets, WidgetGrid } from "./WidgetPlaceholder";
import { SortableSection } from "./SortableSection";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCategory } from "@/hooks/useDashboardCategories";

export function DashboardCategoryGrid() {
  const { 
    sections, 
    isLoading, 
    createSection, 
    updateSectionTitle, 
    deleteSection,
    reorderSections,
    deleteCategory,
    reorderCategories,
  } = useDashboardSections();
  const { cardStyle, dashboardLayout } = useOrganizationSettings();
  const navigate = useNavigate();
  const { organization, isAdmin } = useAuth();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addToSectionId, setAddToSectionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDeleteSection = (sectionId: string) => {
    deleteSection.mutate(sectionId);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory.mutate(categoryId);
  };

  const handleReorderCategories = (sectionId: string, categoryIds: string[]) => {
    reorderCategories.mutate({ sectionId, categoryIds });
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...sections];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        reorderSections.mutate(newOrder.map((s) => s.id));
      }
    }
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

  // Render all sections with drag-and-drop
  const renderSections = () => (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        {sections.map((section, index) => (
          <SortableSection
            key={section.id}
            section={section}
            cardStyle={cardStyle}
            isAdmin={isAdmin}
            isLastSection={index === sections.length - 1}
            onTitleChange={handleTitleChange}
            onAddMenu={handleAddMenu}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onDeleteCategory={handleDeleteCategory}
            onCategoryClick={handleCategoryClick}
            onReorderCategories={handleReorderCategories}
          />
        ))}
      </SortableContext>
    </DndContext>
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
        {renderSections()}
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
