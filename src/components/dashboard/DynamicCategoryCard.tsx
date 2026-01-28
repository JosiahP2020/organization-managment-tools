import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { useAuth } from "@/contexts/AuthContext";

interface DynamicCategoryCardProps {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

export function DynamicCategoryCard({ id, name, icon, description }: DynamicCategoryCardProps) {
  const navigate = useNavigate();
  const { organization } = useAuth();

  const handleClick = () => {
    if (!organization?.slug) return;
    
    const basePath = `/dashboard/${organization.slug}`;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
    
    // Map common category names to existing routes
    if (slug === "shop-and-install" || slug === "shop-install") {
      navigate(`${basePath}/shop-install`);
      return;
    }
    if (slug === "sop" || slug === "training" || slug === "standard-operating-procedures") {
      navigate(`${basePath}/training`);
      return;
    }
    
    // For custom categories, use a generic category route
    navigate(`${basePath}/category/${id}`);
  };

  return (
    <Card 
      className="group relative overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
          <DynamicIcon name={icon} className="w-8 h-8 md:w-10 md:h-10 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
