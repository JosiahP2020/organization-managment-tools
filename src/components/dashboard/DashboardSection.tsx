import { DashboardSection as DashboardSectionType } from "@/hooks/useDashboardSections";
import { DashboardCategory } from "@/hooks/useDashboardCategories";
import { EditableSectionTitle } from "./EditableSectionTitle";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "./CategoryCardVariants";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardSectionProps {
  section: DashboardSectionType;
  onTitleChange: (sectionId: string, newTitle: string) => void;
  onAddMenu: (sectionId: string) => void;
  onAddSection: () => void;
  isLastSection: boolean;
}

export function DashboardSectionComponent({
  section,
  onTitleChange,
  onAddMenu,
  onAddSection,
  isLastSection,
}: DashboardSectionProps) {
  const { cardStyle } = useOrganizationSettings();
  const { organization, isAdmin } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="flex justify-center mb-4">
        <EditableSectionTitle
          title={section.title}
          onTitleChange={(newTitle) => onTitleChange(section.id, newTitle)}
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
        
        {/* Add button */}
        {isAdmin && (
          <div className="flex h-16 md:h-20 items-center justify-center">
            <AddMenuCardButton 
              onAddMenu={() => onAddMenu(section.id)}
              onAddSection={isLastSection ? onAddSection : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
