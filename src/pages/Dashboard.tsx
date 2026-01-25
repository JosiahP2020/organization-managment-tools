import { Construction } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { profile, organization } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {organization?.name || "Your Organization"} Dashboard
          </p>
        </div>

        {/* Work in Progress Card */}
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
            <Construction className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Work in Progress
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're building something great! This dashboard will soon display your 
            projects, tasks, and important metrics.
          </p>
          <div className="w-48 h-2 mx-auto bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Coming soon...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
