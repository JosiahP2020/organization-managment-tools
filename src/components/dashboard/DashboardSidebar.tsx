import { useNavigate } from "react-router-dom";
import { useDashboardCategories } from "@/hooks/useDashboardCategories";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
}

export function DashboardSidebar({ selectedCategoryId, onCategorySelect }: DashboardSidebarProps) {
  const { categories } = useDashboardCategories();
  const { organization } = useAuth();
  const navigate = useNavigate();

  const handleCategoryClick = (category: typeof categories[0]) => {
    onCategorySelect(category.id);
    
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
    navigate(`${basePath}/category/${category.id}`);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card hidden lg:block">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  selectedCategoryId === category.id
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-foreground hover:bg-accent/50"
                )}
              >
                <DynamicIcon 
                  name={category.icon} 
                  className={cn(
                    "w-5 h-5",
                    selectedCategoryId === category.id ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <span className="font-medium truncate">{category.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}
