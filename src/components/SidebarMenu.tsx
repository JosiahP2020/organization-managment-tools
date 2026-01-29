import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { Logo } from "@/components/Logo";

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarMenu({ open, onOpenChange }: SidebarMenuProps) {
  const navigate = useNavigate();
  const { profile, organization, isAdmin, signOut } = useAuth();
  const { subLogoUrl } = useThemeLogos();

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
    navigate("/");
  };

  const NavButton = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleNavigation(to)}
      className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px]"
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-medium">{children}</span>
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-80 p-0 flex flex-col bg-sidebar border-sidebar-border [&>button]:hidden"
      >
        {/* Header - Logo + User Profile */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* User profile - clickable to settings */}
            <button
              onClick={() => handleNavigation("/settings")}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium text-sidebar-foreground">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Admin" : "Employee"}
                </p>
              </div>
            </button>

            {/* Sub-logo on right */}
            <div className="flex-shrink-0">
              <Logo customSrc={subLogoUrl} variant="icon" size="xl" />
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* MENUS Section */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Menus
          </p>
          <Separator className="mb-3 bg-sidebar-border" />
          <NavButton to={`/dashboard/${organization?.slug}`} icon={LayoutDashboard}>
            Dashboard
          </NavButton>

          {/* ADMIN Section - only for admins */}
          {isAdmin && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                Admin
              </p>
              <Separator className="mb-3 bg-sidebar-border" />
              <NavButton to="/admin/users" icon={Users}>
                User Management
              </NavButton>
              <NavButton to="/admin/organization" icon={Building2}>
                Organization Settings
              </NavButton>
            </>
          )}
        </div>

        {/* Footer - Sign Out */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
