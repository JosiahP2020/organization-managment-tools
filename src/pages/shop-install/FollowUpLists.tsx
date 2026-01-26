import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Lock, Trash2, RotateCcw, Archive } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CreateChecklistDialog } from "@/components/training/CreateChecklistDialog";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const FollowUpLists = () => {
  const { organization, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subLogoUrl } = useThemeLogos();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  // Fetch active follow-up lists (checklists with category 'follow_up_list')
  const { data: followUpLists = [], isLoading } = useQuery({
    queryKey: ["follow-up-lists", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("category", "follow_up_list" as any)
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  // Fetch archived follow-up lists
  const { data: archivedLists = [] } = useQuery({
    queryKey: ["follow-up-lists-archived", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("category", "follow_up_list" as any)
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("checklists")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-lists"] });
      queryClient.invalidateQueries({ queryKey: ["follow-up-lists-archived"] });
      toast({ title: "List archived" });
    },
    onError: (error) => {
      toast({ title: "Failed to archive", description: error.message, variant: "destructive" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("checklists")
        .update({ archived_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-lists"] });
      queryClient.invalidateQueries({ queryKey: ["follow-up-lists-archived"] });
      toast({ title: "List restored" });
    },
    onError: (error) => {
      toast({ title: "Failed to restore", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-lists"] });
      queryClient.invalidateQueries({ queryKey: ["follow-up-lists-archived"] });
      toast({ title: "List deleted permanently" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenChecklist = (id: string) => {
    if (organization?.slug) {
      navigate(`/dashboard/${organization.slug}/shop-install/projects/follow-up-lists/${id}`);
    }
  };

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["follow-up-lists"] });
    setCreateDialogOpen(false);
  };

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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Follow-up Lists
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage project follow-up tasks.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          )}
        </div>

        {/* Active Lists */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : followUpLists.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No follow-up lists yet.</p>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first list
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {followUpLists.map((list) => (
              <Card 
                key={list.id}
                className="group cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => handleOpenChecklist(list.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {list.title}
                        {list.is_locked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate(list.id);
                          }}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {list.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Archived Lists */}
        {archivedLists.length > 0 && (
          <Collapsible 
            open={archivedExpanded} 
            onOpenChange={setArchivedExpanded}
            className="mt-8"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <Archive className="w-4 h-4 mr-2" />
                Archived ({archivedLists.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {archivedLists.map((list) => (
                <Card 
                  key={list.id}
                  className="group opacity-60 hover:opacity-100 transition-all"
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-muted-foreground">
                        {list.title}
                      </CardTitle>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => restoreMutation.mutate(list.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setItemToDelete({ id: list.id, title: list.title });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Create Dialog - reusing existing component with a new category */}
        <CreateChecklistDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          category="follow_up_list"
          onSuccess={handleCreateSuccess}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{itemToDelete?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default FollowUpLists;
