import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  GraduationCap,
  ShoppingBag,
  Wrench,
  LogOut,
  User,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import sccLogo from "@/assets/scc-logo.gif";

interface NavigationMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}

function NavItem({ to, icon, label, badge, onClick }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent transition-colors min-h-[48px]"
    >
      <span className="text-primary">{icon}</span>
      <span className="font-medium flex-1">{label}</span>
      {badge && (
        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AppNavigationMenu({ open, onOpenChange }: NavigationMenuProps) {
  const { profile, isAdmin, signOut, organization } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => onOpenChange(false);

  const handleSignOut = async () => {
    handleClose();
    await signOut();
    navigate("/login");
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Use organization logo if available, otherwise fall back to default SCC logo
  const sidebarLogo = organization?.logo_url || sccLogo;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        {/* Header with Logo - aligned left */}
        <SheetHeader className="p-6 pb-4">
          <div className="flex justify-start">
            <img
              src={sidebarLogo}
              alt={organization?.name || "SCC"}
              className="h-16 w-auto max-w-[200px] object-contain"
            />
          </div>
        </SheetHeader>

        {/* User Profile Section - Right below the logo */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl">
            <Avatar className="h-10 w-10">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.avatar_url ? null : getInitials(profile?.full_name)}
                {!profile?.avatar_url && !profile?.full_name && (
                  <User className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Admin" : "Employee"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            onClick={handleClose}
          />
          <NavItem
            to="/dashboard"
            icon={<GraduationCap className="h-5 w-5" />}
            label="Training"
            badge="Coming Soon"
            onClick={handleClose}
          />
          <NavItem
            to="/dashboard"
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Shop"
            badge="Coming Soon"
            onClick={handleClose}
          />
          <NavItem
            to="/dashboard"
            icon={<Wrench className="h-5 w-5" />}
            label="Install"
            badge="Coming Soon"
            onClick={handleClose}
          />
        </nav>

        <Separator />

        {/* Sign Out */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
