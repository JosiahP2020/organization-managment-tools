import { Menu, Settings, User, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppNavigationMenu } from "@/components/AppNavigationMenu";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
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

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-40">
        {/* Menu Button - Left */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="h-11 w-11 text-foreground hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo - Center (positioned absolutely for overflow effect) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1">
          <Link to="/dashboard" className="flex items-center">
            <Logo 
              variant="full" 
              size="xl" 
              customSrc={organization?.logo_url}
              className="drop-shadow-sm"
            />
          </Link>
        </div>

        {/* Settings Dropdown - Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-foreground hover:bg-accent"
              aria-label="Settings"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border z-50">
            <DropdownMenuItem asChild>
              <Link to="/settings/account" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/user" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile Settings
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
      </header>

      <AppNavigationMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
