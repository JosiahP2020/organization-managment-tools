import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  GraduationCap,
  ShoppingBag,
  Wrench,
  Users,
  Building2,
  LogOut,
  User,
} from "lucide-react";
import shellstarLogo from "@/assets/shellstar-logo.png";

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

export function NavigationMenu({ open, onOpenChange }: NavigationMenuProps) {
  const { profile, organization, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => onOpenChange(false);

  const handleSignOut = async () => {
    await signOut();
    handleClose();
    navigate("/");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        {/* Header with Logo */}
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={shellstarLogo}
              alt="ShellStar Custom Cabinets"
              className="h-10 w-auto"
            />
          </div>
          <SheetTitle className="text-left text-sm text-muted-foreground mt-2">
            {organization?.name || "Organization"}
          </SheetTitle>
        </SheetHeader>

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

          {/* Admin Section */}
          {isAdmin && (
            <>
              <Separator className="my-4" />
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Admin
              </p>
              <NavItem
                to="/admin/users"
                icon={<Users className="h-5 w-5" />}
                label="Users"
                onClick={handleClose}
              />
              <NavItem
                to="/admin/organization"
                icon={<Building2 className="h-5 w-5" />}
                label="Organization"
                onClick={handleClose}
              />
            </>
          )}
        </nav>

        <Separator />

        {/* User Profile & Sign Out */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Admin" : "Employee"}
              </p>
            </div>
          </div>

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
