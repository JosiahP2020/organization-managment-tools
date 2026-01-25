import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import OrganizationLogin from "./pages/OrganizationLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import CreateOrganization from "./pages/CreateOrganization";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import Settings from "./pages/settings/Settings";
import UserManagement from "./pages/admin/UserManagement";
import OrganizationSettings from "./pages/admin/OrganizationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<OrganizationLogin />} />
            <Route path="/login/:organizationName" element={<EmployeeLogin />} />
            <Route path="/create-organization" element={<CreateOrganization />} />
            <Route path="/dashboard/:orgSlug" element={<Dashboard />} />
            <Route path="/dashboard/:orgSlug/training" element={<Training />} />
            <Route path="/settings" element={<Settings />} />
            {/* Legacy routes redirect to new combined settings */}
            <Route path="/settings/account" element={<Settings />} />
            <Route path="/settings/preferences" element={<Settings />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/organization" element={<OrganizationSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
