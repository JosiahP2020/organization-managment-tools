import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-surface-subtle">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <header className="h-14 flex items-center gap-4 px-4 border-b border-border bg-background">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </header>
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
