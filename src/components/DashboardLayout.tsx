import { DashboardHeader } from "@/components/DashboardHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EditModeToggle } from "@/components/EditModeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-surface-subtle">
        <DashboardHeader />
        <EditModeToggle />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
