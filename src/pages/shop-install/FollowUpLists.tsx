import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Lock, ClipboardList, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CreateChecklistDialog } from "@/components/training/CreateChecklistDialog";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { Skeleton } from "@/components/ui/skeleton";

const FollowUpLists = () => {
  const { projectId, orgSlug } = useParams<{ projectId: string; orgSlug: string }>();
  const { organization, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subLogoUrl } = useThemeLogos();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  // Fetch follow-up list for this project (single item)
  const { data: followUpList, isLoading } = useQuery({
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

  // Create a new follow-up list for this project
  const handleCreateFollowUpList = async () => {
    if (!organization?.id || !projectId || !user?.id) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: `${project?.title || "Project"} - Follow-up List`,
          organization_id: organization.id,
          created_by: user.id,
          category: "follow_up_list" as any,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Follow-up list created" });
      queryClient.invalidateQueries({ queryKey: ["follow-up-list", projectId] });
      
      // Navigate to the new checklist
      navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/follow-up-list/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Failed to create follow-up list",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChecklist = () => {
    if (followUpList) {
      navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/follow-up-list/${followUpList.id}`);
    }
  };

  if (projectLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 md:mb-8">
            <Skeleton className="h-20 w-48" />
          </div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-24 w-full" />
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
        {/* Header with logo */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="lg" 
            customSrc={subLogoUrl} 
            variant="full"
            className="max-h-20 md:max-h-24"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Follow-up List
          </h1>
          <p className="text-muted-foreground mt-1">
            {project.title}
          </p>
        </div>

        {/* Show existing follow-up list or create button */}
        {followUpList ? (
          <Card 
            className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            onClick={handleOpenChecklist}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {followUpList.title}
                      {followUpList.is_locked && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    {followUpList.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {followUpList.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Follow-up List Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Create a follow-up list to track tasks for this project.
              </p>
              {isAdmin && (
                <Button 
                  onClick={handleCreateFollowUpList}
                  disabled={isCreating}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Follow-up List"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden dialog - kept for potential future use but not used currently */}
        <CreateChecklistDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          category="follow_up_list"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["follow-up-list", projectId] });
            setCreateDialogOpen(false);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default FollowUpLists;
