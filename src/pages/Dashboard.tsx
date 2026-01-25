import { GraduationCap, ShoppingBag, Wrench } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { DevOrientationToggle } from "@/components/DevOrientationToggle";

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

function CategoryCard({ icon, title, description, comingSoon = false }: CategoryCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer">
      <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
          <span className="text-primary">{icon}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Coming Soon Badge */}
        {comingSoon && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Coming Soon
          </span>
        )}
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const { organization } = useAuth();

  // Use main_logo_url if available, otherwise fall back to logo_url
  const mainLogoUrl = organization?.main_logo_url || organization?.logo_url || null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Organization Logo - Centered */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            className="max-h-32 md:max-h-40"
          />
        </div>

        {/* Dashboard Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {organization?.name || "Your Organization"} Dashboard
          </h1>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <CategoryCard
            icon={<GraduationCap className="w-8 h-8 md:w-10 md:h-10" />}
            title="Training"
            description="Access training materials, courses, and certification programs."
            comingSoon
          />
          <CategoryCard
            icon={<ShoppingBag className="w-8 h-8 md:w-10 md:h-10" />}
            title="Shop"
            description="Browse and order cabinet hardware, materials, and supplies."
            comingSoon
          />
          <CategoryCard
            icon={<Wrench className="w-8 h-8 md:w-10 md:h-10" />}
            title="Install"
            description="Installation guides, schedules, and project management tools."
            comingSoon
          />
        </div>
      </div>

      {/* Development Orientation Toggle */}
      <DevOrientationToggle />
    </DashboardLayout>
  );
};

export default Dashboard;
