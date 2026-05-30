import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardCategoryGrid } from "@/components/dashboard/DashboardCategoryGrid";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Dynamic Category Cards Grid */}
        <DashboardCategoryGrid />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
