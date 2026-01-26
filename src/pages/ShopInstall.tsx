import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";

interface CategorySectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function CategorySection({ icon, title, description, onClick }: CategorySectionProps) {
  return (
    <Card 
      className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-primary">{icon}</span>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

const ShopInstall = () => {
  const { organization } = useAuth();
  const navigate = useNavigate();
  const { mainLogoUrl } = useThemeLogos();

  const handleCategoryClick = (category: string) => {
    if (organization?.slug) {
      navigate(`/dashboard/${organization.slug}/shop-install/${category}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Organization Logo - Centered */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            className="max-h-32 md:max-h-40"
          />
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Shop & Install
          </h1>
          <p className="text-muted-foreground mt-1">
            Project management, follow-up lists, and measurement tools.
          </p>
        </div>

        <div className="space-y-4">
          {/* Projects */}
          <CategorySection
            icon={<FolderOpen className="w-5 h-5" />}
            title="Projects"
            description="Manage project follow-up lists and pipe drawer measurements."
            onClick={() => handleCategoryClick('projects')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShopInstall;
