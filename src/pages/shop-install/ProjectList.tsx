import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, Search, Pencil, Archive, Trash2, ArrowUpDown, ChevronDown, ArchiveRestore } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/shop-install/CreateProjectDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "@/hooks/use-toast";

type SortOption = "recent" | "oldest" | "alphabetical";

const sortLabels: Record<SortOption, string> = {
  recent: "Recently Updated",
  oldest: "Oldest First",
  alphabetical: "Alphabetically",
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  updated_at: string | null;
  archived_at: string | null;
};

const ProjectList = () => {
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch active projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("organization_id", organization.id)
        .is("archived_at", null)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as Project[];
    },
    enabled: !!organization?.id,
  });

  // Fetch archived projects
  const { data: archivedProjects } = useQuery({
    queryKey: ["projects-archived", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("organization_id", organization.id)
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as Project[];
    },
    enabled: !!organization?.id,
  });

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = (projects || []).filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    switch (sortOption) {
      case "alphabetical":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "oldest":
        result = [...result].sort((a, b) => 
          new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime()
        );
        break;
      case "recent":
      default:
        result = [...result].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
        break;
    }
    
    return result;
  }, [projects, searchQuery, sortOption]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-archived"] });
      toast({ title: "Project deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete project", description: error.message, variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects" as any)
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-archived"] });
      toast({ title: "Project archived successfully" });
      setArchiveDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to archive project", description: error.message, variant: "destructive" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects" as any)
        .update({ archived_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-archived"] });
      toast({ title: "Project restored successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to restore project", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title: string; description: string | null }) => {
      const { error } = await supabase
        .from("projects" as any)
        .update({ title, description })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-archived"] });
      toast({ title: "Project updated successfully" });
      setEditDialogOpen(false);
      setEditingProject(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update project", description: error.message, variant: "destructive" });
    },
  });

  const handleProjectClick = (project: Project) => {
    navigate(`/dashboard/${organization?.slug}/shop-install/projects/${project.id}`);
  };

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDescription(project.description || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProject || !editTitle.trim()) return;
    updateMutation.mutate({
      id: editingProject.id,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
    });
  };

  const handleArchive = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setArchiveDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    restoreMutation.mutate(project.id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Organization Logo */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="xl" 
            customSrc={mainLogoUrl} 
            variant="full"
            className="max-h-32 md:max-h-40"
          />
        </div>

        {/* Header with title and create button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage shop and installation projects.
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {sortLabels[sortOption]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border">
              <DropdownMenuItem onClick={() => setSortOption("recent")}>
                Recently Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("alphabetical")}>
                Alphabetically
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Projects list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedProjects.map((project) => (
              <Card 
                key={project.id}
                className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                onClick={() => handleProjectClick(project)}
              >
                <CardHeader className={project.description ? "pb-2" : ""}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleEdit(e, project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleArchive(e, project)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(e, project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {project.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No projects yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {searchQuery 
                  ? "No projects match your search."
                  : "Create your first project to start organizing follow-up lists and measurements."}
              </p>
              {isAdmin && !searchQuery && (
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Archived Projects Section */}
        {(archivedProjects?.length || 0) > 0 && (
          <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen} className="mt-8">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                <span className="text-muted-foreground font-medium">
                  Archived Projects ({archivedProjects?.length})
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${archivedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              {archivedProjects?.map((project) => (
                <Card 
                  key={project.id}
                  className="opacity-60"
                >
                  <CardHeader className={project.description ? "pb-2" : ""}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg text-muted-foreground">{project.title}</CardTitle>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleRestore(e, project)}
                          >
                            <ArchiveRestore className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(e, project)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {project.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}
        />

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the project details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Project Name</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter project name..."
                  maxLength={100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter project description..."
                  maxLength={500}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!editTitle.trim() || updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{selectedProject?.title}"? This will move it to the archived section.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => selectedProject && archiveMutation.mutate(selectedProject.id)}>
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{selectedProject?.title}"? This action cannot be undone and will also delete all associated follow-up lists and measurements.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedProject && deleteMutation.mutate(selectedProject.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default ProjectList;
