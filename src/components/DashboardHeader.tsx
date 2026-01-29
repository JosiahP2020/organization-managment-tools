import { Settings, Users, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  const { isAdmin, organization } = useAuth();
  const location = useLocation();
  
  // Show back button on sub-pages, not on main dashboard (/dashboard/:orgSlug)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isMainDashboard = pathParts.length === 2 && pathParts[0] === 'dashboard';
  const showBackButton = !isMainDashboard;

  return (
    <>
      {/* Floating buttons without header background */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 pointer-events-none">
        {/* Left side - Back Button only on sub-pages */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {showBackButton && <BackButton fallbackPath={`/dashboard/${organization?.slug}`} />}
        </div>

        {/* Settings Dropdown - Right - Only show on main dashboard */}
        {isMainDashboard && (
          <div className="pointer-events-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 text-foreground bg-background border-border shadow-md hover:bg-accent"
                  aria-label="Settings"
                >
                  <Settings className="h-8 w-8" />
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
        )}
      </div>
      
      {/* Spacer to prevent content from going under fixed buttons */}
      <div className="h-20" />
    </>
  );
}