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
import Settings from "./pages/settings/Settings";
import UserManagement from "./pages/admin/UserManagement";
import OrganizationSettings from "./pages/admin/OrganizationSettings";
import NotFound from "./pages/NotFound";

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
                <Route path="/settings" element={<Settings />} />
                {/* Legacy routes redirect to new combined settings */}
                <Route path="/settings/account" element={<Settings />} />
                <Route path="/settings/preferences" element={<Settings />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/organization" element={<OrganizationSettings />} />
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
