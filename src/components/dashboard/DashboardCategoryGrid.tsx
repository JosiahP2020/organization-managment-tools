import { GraduationCap, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardCategories } from "@/hooks/useDashboardCategories";
import { DynamicCategoryCard } from "./DynamicCategoryCard";
import { useAuth } from "@/contexts/AuthContext";

// Fallback static card for when no dynamic categories exist
interface StaticCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function StaticCategoryCard({ icon, title, description, onClick }: StaticCategoryCardProps) {
  return (
    <Card 
      className="group relative overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
          <span className="text-primary">{icon}</span>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardCategoryGrid() {
  const { categories, isLoading } = useDashboardCategories();
  const { organization } = useAuth();
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <Skeleton className="h-48 md:h-56 rounded-xl" />
        <Skeleton className="h-48 md:h-56 rounded-xl" />
      </div>
    );
  }

  // If we have dynamic categories from the database, render them
  if (categories.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {categories.map((category) => (
          <DynamicCategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            icon={category.icon}
            description={category.description}
          />
        ))}
      </div>
    );
  }

  // Fallback: Show static cards if no categories are configured
  const handleTrainingClick = () => {
    if (organization?.slug) {
      navigate(`/dashboard/${organization.slug}/training`);
    }
  };

  const handleShopInstallClick = () => {
    if (organization?.slug) {
      navigate(`/dashboard/${organization.slug}/shop-install`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      <StaticCategoryCard
        icon={<Wrench className="w-8 h-8 md:w-10 md:h-10" />}
        title="Shop & Install"
        description="Project management, follow-up lists, and measurement tools."
        onClick={handleShopInstallClick}
      />
      <StaticCategoryCard
        icon={<GraduationCap className="w-8 h-8 md:w-10 md:h-10" />}
        title="SOP"
        description="SOP, Machine Operation, and Machine Maintenance."
        onClick={handleTrainingClick}
      />
    </div>
  );
}
