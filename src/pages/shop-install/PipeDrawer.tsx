import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ruler, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const PipeDrawer = () => {
  const { projectId, orgSlug } = useParams<{ projectId: string; orgSlug: string }>();
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as { id: string; title: string; description: string | null } | null;
    },
    enabled: !!projectId,
  });

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 md:mb-8">
            <Skeleton className="h-20 w-48" />
          </div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/dashboard/${orgSlug}/shop-install/projects`)}>
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Main logo centered */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            className="max-h-32 md:max-h-40"
          />
        </div>

        {/* Project name as main title, Pipe Drawer Measurements as subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Pipe Drawer Measurements
          </p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Measurements Yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Create pipe drawer measurements for this project.
            </p>
            {isAdmin && (
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Measurement
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PipeDrawer;
