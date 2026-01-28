import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { Logo } from "@/components/Logo";
import { DashboardCategoryGrid } from "@/components/dashboard/DashboardCategoryGrid";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const Dashboard = () => {
  const { organization } = useAuth();
  const { mainLogoUrl, logoFilterClass } = useThemeLogos();
  const { dashboardLayout } = useOrganizationSettings();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  // Sidebar-left layout wraps content differently
  if (dashboardLayout === 'sidebar-left') {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-6">
          {/* Sidebar */}
          <DashboardSidebar 
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
          />
          
          {/* Main content area */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Organization Logo - Centered */}
              <div className="flex justify-center mb-6 md:mb-8">
                <Logo 
                  size="xl" 
                  customSrc={mainLogoUrl} 
                  variant="full"
                  filterClass={logoFilterClass}
                  className="max-h-32 md:max-h-40"
                />
              </div>

              {/* Dashboard Title */}
              <div className="text-center mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {organization?.display_name || organization?.name || "Your Organization"} Dashboard
                </h1>
              </div>

              {/* Dynamic Category Cards Grid */}
              <DashboardCategoryGrid />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Default layout (and all other layouts)
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Organization Logo - Centered */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            filterClass={logoFilterClass}
            className="max-h-32 md:max-h-40"
          />
        </div>

        {/* Dashboard Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {organization?.display_name || organization?.name || "Your Organization"} Dashboard
          </h1>
        </div>

        {/* Dynamic Category Cards Grid */}
        <DashboardCategoryGrid />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
