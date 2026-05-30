import { useState } from "react";
import { Settings, Users, Building2, Menu } from "lucide-react";
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
import { SidebarMenu } from "@/components/SidebarMenu";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";

export function DashboardHeader() {
  const { isAdmin, organization } = useAuth();
  const location = useLocation();
  const { mainLogoUrl, logoFilterClass } = useThemeLogos();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Show back button on sub-pages, not on main dashboard (/dashboard/:orgSlug)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isMainDashboard = pathParts.length === 2 && pathParts[0] === 'dashboard';
  const showBackButton = !isMainDashboard;

  return (
    <>
      {/* In-flow buttons that scroll with the page */}
      <div className="relative w-full flex items-center justify-between p-4">
        {/* Left side - Menu Button or Back Button */}
        <div className="flex items-center gap-2">
          {isMainDashboard ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-14 w-14 text-foreground bg-background border-border shadow-md hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-8 w-8" />
            </Button>
          ) : (
            <BackButton fallbackPath={`/dashboard/${organization?.slug}`} />
          )}
        </div>

        {/* Center - Logo (main dashboard only) */}
        {isMainDashboard && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none px-2" style={{ maxWidth: 'calc(100% - 8rem)' }}>
            <Logo
              size="xl"
              customSrc={mainLogoUrl}
              variant="full"
              filterClass={logoFilterClass}
              className="max-h-20 w-auto object-contain"
            />
          </div>
        )}


        {/* Settings Dropdown - Right - Only show on main dashboard */}
        {isMainDashboard && (
          <div>
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


      {/* Sidebar Menu */}
      <SidebarMenu open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
