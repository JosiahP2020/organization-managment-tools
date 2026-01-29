import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAccentColor } from "@/hooks/useAccentColor";
import Index from "./pages/Index";
import OrganizationLogin from "./pages/OrganizationLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import CreateOrganization from "./pages/CreateOrganization";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import CategoryDocuments from "./pages/training/CategoryDocuments";
import ChecklistEditor from "./pages/training/ChecklistEditor";
import GembaDocEditor from "./pages/training/GembaDocEditor";
import ShopInstall from "./pages/ShopInstall";
import ProjectList from "./pages/shop-install/ProjectList";
import ProjectDetail from "./pages/shop-install/ProjectDetail";
import Settings from "./pages/settings/Settings";
import UserManagement from "./pages/admin/UserManagement";
import OrganizationSettings from "./pages/admin/OrganizationSettings";
import NotFound from "./pages/NotFound";
// Dev test pages
import DashboardFullWidth from "./pages/dev/DashboardFullWidth";
import DashboardGridRight from "./pages/dev/DashboardGridRight";
import DashboardSidebarLeft from "./pages/dev/DashboardSidebarLeft";
import DashboardMasonry from "./pages/dev/DashboardMasonry";

const queryClient = new QueryClient();

// Component to apply accent color from organization settings
function AccentColorProvider({ children }: { children: React.ReactNode }) {
  useAccentColor();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AccentColorProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<OrganizationLogin />} />
                <Route path="/login/:organizationName" element={<EmployeeLogin />} />
                <Route path="/create-organization" element={<CreateOrganization />} />
                <Route path="/dashboard/:orgSlug" element={<Dashboard />} />
                <Route path="/dashboard/:orgSlug/training" element={<Training />} />
                <Route path="/dashboard/:orgSlug/training/:category" element={<CategoryDocuments />} />
                <Route path="/dashboard/:orgSlug/training/:category/:checklistId" element={<ChecklistEditor />} />
                <Route path="/dashboard/:orgSlug/training/:category/gemba/:gembaDocId" element={<GembaDocEditor />} />
                <Route path="/dashboard/:orgSlug/shop-install" element={<ShopInstall />} />
                <Route path="/dashboard/:orgSlug/shop-install/projects" element={<ProjectList />} />
                <Route path="/dashboard/:orgSlug/shop-install/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/dashboard/:orgSlug/shop-install/projects/:projectId/follow-up-list/:checklistId" element={<ChecklistEditor />} />
                {/* Category detail route removed during teardown - will be rebuilt */}
                <Route path="/settings" element={<Settings />} />
                {/* Legacy routes redirect to new combined settings */}
                <Route path="/settings/account" element={<Settings />} />
                <Route path="/settings/preferences" element={<Settings />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/organization" element={<OrganizationSettings />} />
                {/* Dev test pages for layout/card style testing */}
                <Route path="/dev/dashboard-full-width" element={<DashboardFullWidth />} />
                <Route path="/dev/dashboard-grid-right" element={<DashboardGridRight />} />
                <Route path="/dev/dashboard-sidebar-left" element={<DashboardSidebarLeft />} />
                <Route path="/dev/dashboard-masonry" element={<DashboardMasonry />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AccentColorProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
