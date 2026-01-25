import { Menu, Settings, Users, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppNavigationMenu } from "@/components/AppNavigationMenu";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BackButton } from "@/components/BackButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin, organization } = useAuth();
  const location = useLocation();
  
  // Show back button on all pages except the main dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");
  const showBackButton = !isDashboard;

  return (
    <>
      {/* Floating header with just menu and settings buttons */}
      <div className="sticky top-0 z-40 flex items-center justify-between p-4 bg-surface-subtle">
        {/* Left side - Menu Button or Back Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            className="h-12 w-12 text-foreground hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </Button>
          {showBackButton && <BackButton fallbackPath={`/dashboard/${organization?.slug}`} />}
        </div>

        {/* Settings Dropdown - Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-foreground hover:bg-accent"
              aria-label="Settings"
            >
              <Settings className="h-7 w-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border z-50">
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/users" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4" />
                    User Management
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/organization" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="h-4 w-4" />
                    Organization Settings
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AppNavigationMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
