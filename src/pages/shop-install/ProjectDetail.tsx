import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Plus, Lock, Trash2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { projectId, orgSlug } = useParams<{ projectId: string; orgSlug: string }>();
  const { organization, isAdmin, user } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Fetch item counts for the follow-up list
  const { data: itemCounts } = useQuery({
    queryKey: ["follow-up-list-counts", followUpList?.id],
    queryFn: async () => {
      if (!followUpList?.id) return { total: 0, completed: 0 };
      
      // First get all section IDs for this checklist
      const { data: sections, error: sectionsError } = await supabase
        .from("checklist_sections")
        .select("id")
        .eq("checklist_id", followUpList.id);
      
      if (sectionsError) throw sectionsError;
      if (!sections || sections.length === 0) return { total: 0, completed: 0 };
      
      const sectionIds = sections.map(s => s.id);
      
      // Get all items for these sections
      const { data: items, error: itemsError } = await supabase
        .from("checklist_items")
        .select("is_completed")
        .in("section_id", sectionIds);
      
      if (itemsError) throw itemsError;
      
      const total = items?.length || 0;
      const completed = items?.filter(item => item.is_completed).length || 0;
      
      return { total, completed };
    },
    enabled: !!followUpList?.id,
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

      toast.success("Follow-up list created");
      queryClient.invalidateQueries({ queryKey: ["follow-up-list", projectId] });
      
      // Navigate to the new checklist
      navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/follow-up-list/${data.id}`);
    } catch (error: any) {
      toast.error("Failed to create follow-up list");
    } finally {
      setIsCreating(false);
    }
  };

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

  const handleOpenChecklist = () => {
    if (followUpList) {
      navigate(`/dashboard/${orgSlug}/shop-install/projects/${projectId}/follow-up-list/${followUpList.id}`);
    }
  };

  const handleDeleteFollowUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this follow-up list?")) {
      deleteFollowUpMutation.mutate();
    }
  };

  if (projectLoading || followUpLoading) {
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
        {/* Main logo centered */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            className="max-h-32 md:max-h-40"
          />
        </div>

        {/* Project title */}
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

        {/* Follow-up List Section */}
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
                      Follow-up List
                      {followUpList.is_locked && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {itemCounts && itemCounts.total > 0 
                        ? `${itemCounts.completed} of ${itemCounts.total} completed`
                        : "No items yet"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleDeleteFollowUp}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
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
                Follow-up List
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
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
