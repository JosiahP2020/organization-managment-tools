import { DashboardHeader } from "@/components/DashboardHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SelectionProvider, SelectionActionBar } from "@/components/selection";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SelectionProvider>
        <div className="min-h-screen flex flex-col bg-surface-subtle">
          <SelectionActionBar />
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </SelectionProvider>
    </ProtectedRoute>
  );
}
