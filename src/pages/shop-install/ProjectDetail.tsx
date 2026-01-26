import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Ruler, Trash2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { projectId, orgSlug } = useParams<{ projectId: string; orgSlug: string }>();
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Fetch follow-up list for this project
  const { data: followUpList, isLoading: followUpLoading } = useQuery({
    queryKey: ["follow-up-list", projectId, organization?.id],
    queryFn: async () => {
      if (!organization?.id || !projectId) return null;
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("project_id", projectId)
        .eq("category", "follow_up_list" as any)
        .is("archived_at", null)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id && !!projectId,
  });

  // Delete follow-up list mutation
  const deleteFollowUpMutation = useMutation({
    mutationFn: async () => {
      if (!followUpList) return;
      
      const { error } = await supabase
        .from("checklists")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", followUpList.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-list", projectId] });
      toast.success("Follow-up list deleted");
    },
    onError: () => {
      toast.error("Failed to delete follow-up list");
    },
  });

  const handleFollowUpClick = () => {
    if (followUpList) {
      navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/follow-up-list/${followUpList.id}`);
    } else {
      navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/follow-up-list`);
    }
  };

  const handleDeleteFollowUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this follow-up list?")) {
      deleteFollowUpMutation.mutate();
    }
  };

  const handlePipeDrawerClick = () => {
    navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/pipe-drawer`);
  };

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 md:mb-8">
            <Skeleton className="h-20 w-48" />
          </div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
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

        {/* Project title on left */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">
              {project.description}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Follow-up List Section */}
          <Card 
            className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            onClick={handleFollowUpClick}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Follow-up List</h3>
                    {followUpLoading ? (
                      <Skeleton className="h-4 w-32 mt-1" />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {followUpList ? "View or edit your follow-up list" : "Create a follow-up list"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {followUpList && isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleDeleteFollowUp}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipe Drawer Measurement Section */}
          <Card 
            className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            onClick={handlePipeDrawerClick}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Ruler className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Pipe Drawer Measurements</h3>
                    <p className="text-sm text-muted-foreground">
                      Record measurements for pipe drawers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
