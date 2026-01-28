import { Home, Users, Building2, LogOut, Settings } from "lucide-react";
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

export function DynamicSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, organization, isAdmin, signOut } = useAuth();
  const { subLogoUrl } = useThemeLogos();
  const { categories, isLoading } = useSidebarCategories();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const basePath = organization?.slug ? `/dashboard/${organization.slug}` : "/login";

  // Static items that are always present
  const mainItems = [
    { title: "Dashboard", url: basePath, icon: Home },
  ];

  const adminItems = [
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Organization", url: "/admin/organization", icon: Building2 },
    { title: "Menu Config", url: "/admin/menu-config", icon: Settings },
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

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      activeClassName="bg-accent text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Categories from Database */}
        {isLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Modules
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : categories.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Modules
            </SidebarGroupLabel>
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
                        <DynamicIcon name={category.icon} className="h-4 w-4 shrink-0" />
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
                        <item.icon className="h-4 w-4 shrink-0" />
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
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {isAdmin ? "Admin" : "Employee"}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
