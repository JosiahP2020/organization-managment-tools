import { Users, Building2, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useSidebarCategories } from "@/hooks/useSidebarCategories";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Logo } from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function DynamicSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, organization, isAdmin, signOut } = useAuth();
  const { subLogoUrl } = useThemeLogos();
  const { categories, isLoading } = useSidebarCategories();
  const navigate = useNavigate();
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const basePath = organization?.slug ? `/dashboard/${organization.slug}` : "/login";

  const adminItems = [
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Organization Settings", url: "/admin/organization", icon: Building2 },
  ];

  // Build URL for a category based on its type/name
  const getCategoryUrl = (category: { id: string; name: string }) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
    
    // Map common category names to existing routes
    if (slug === "shop-and-install" || slug === "shop-install") {
      return `${basePath}/shop-install`;
    }
    if (slug === "sop" || slug === "training" || slug === "standard-operating-procedures") {
      return `${basePath}/training`;
    }
    
    // For custom categories, use a generic category route
    return `${basePath}/category/${category.id}`;
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Logo variant={collapsed ? "icon" : "icon"} size="sm" customSrc={subLogoUrl} />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-foreground">
                {organization?.display_name || organization?.name || "ShellStar"}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {organization?.name || "Custom Cabinets"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* User Profile Section */}
      <div className="px-3 pb-3">
        <div 
          className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg relative"
          onMouseEnter={() => setIsProfileHovered(true)}
          onMouseLeave={() => setIsProfileHovered(false)}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {isAdmin ? "Admin" : "Employee"}
                </p>
              </div>
              {/* Settings gear icon - only visible on hover */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSettingsClick}
                className={`h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground transition-opacity ${
                  isProfileHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <SidebarContent>
        {/* Dashboard - No group label, direct item */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={basePath}
                    end
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    activeClassName="bg-accent text-primary font-medium border-l-2 border-primary"
                  >
                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Categories from Database */}
        {isLoading ? (
          <div className="space-y-2 px-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : categories.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={getCategoryUrl(category)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        activeClassName="bg-accent text-primary font-medium border-l-2 border-primary"
                      >
                        <DynamicIcon name={category.icon} className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{category.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {/* Admin Navigation - Only visible to admins */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        activeClassName="bg-accent text-primary font-medium border-l-2 border-primary"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}