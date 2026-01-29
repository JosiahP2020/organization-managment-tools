import { DashboardLayout } from "@/components/DashboardLayout";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { Logo } from "@/components/Logo";
import { DashboardCategoryGrid } from "@/components/dashboard/DashboardCategoryGrid";

const Dashboard = () => {
  const { mainLogoUrl, logoFilterClass } = useThemeLogos();

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

        {/* Dynamic Category Cards Grid */}
        <DashboardCategoryGrid />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;