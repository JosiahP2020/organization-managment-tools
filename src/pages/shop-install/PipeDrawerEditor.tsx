import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ruler } from "lucide-react";

const PipeDrawerEditor = () => {
  const { projectId, pipeDrawerId, orgSlug } = useParams<{ 
    projectId: string; 
    pipeDrawerId: string; 
    orgSlug: string;
  }>();
  const { organization } = useAuth();
  const { subLogoUrl } = useThemeLogos();
  const navigate = useNavigate();

  // Fetch pipe drawer details
  const { data: pipeDrawer, isLoading } = useQuery({
    queryKey: ["pipe-drawer-detail", pipeDrawerId],
    queryFn: async () => {
      if (!pipeDrawerId) return null;
      
      const { data, error } = await supabase
        .from("pipe_drawer_measurements" as any)
        .select("*")
        .eq("id", pipeDrawerId)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as { 
        id: string; 
        notes: string | null;
        project_id: string;
      } | null;
    },
    enabled: !!pipeDrawerId,
  });

  // Fetch project details for title
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as { id: string; title: string } | null;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Skeleton className="h-16 w-32" />
          </div>
          <Skeleton className="h-10 w-64 mx-auto mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!pipeDrawer) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-foreground mb-2">Not Found</h1>
          <p className="text-muted-foreground mb-4">This pipe drawer measurement doesn't exist.</p>
          <Button onClick={() => navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}`)}>
            Back to Project
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Sub logo centered */}
        <div className="flex justify-center mb-6">
          <Logo 
            size="lg" 
            customSrc={subLogoUrl} 
            variant="full"
            className="max-h-20"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          {project?.title} - Pipe Drawer Measurements
        </h1>

        {/* Placeholder content */}
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Pipe Drawer Measurements
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This is where you'll record pipe drawer measurements for the project.
              The form and file upload functionality will be added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PipeDrawerEditor;
