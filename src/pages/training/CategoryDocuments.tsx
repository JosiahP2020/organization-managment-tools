import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Plus, FileText, Lock, Search, Pencil, Archive, Trash2, ArrowUpDown, ChevronDown, ArchiveRestore } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateChecklistDialog } from "@/components/training/CreateChecklistDialog";
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

const categoryLabels: Record<string, string> = {
  machine_operation: "Machine Operation",
  machine_maintenance: "Machine Maintenance",
  sop_training: "SOP/Training",
};

type SortOption = "recent" | "oldest" | "alphabetical";

const sortLabels: Record<SortOption, string> = {
  recent: "Recently Updated",
  oldest: "Oldest First",
  alphabetical: "Alphabetically",
};

const CategoryDocuments = () => {
  const { category, orgSlug } = useParams<{ category: string; orgSlug: string }>();
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<{ id: string; title: string } | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const categoryLabel = categoryLabels[category || ""] || category;

  // Fetch active checklists
  const { data: checklists, isLoading, refetch } = useQuery({
    queryKey: ["checklists", category, organization?.id],
    queryFn: async () => {
      if (!organization?.id || !category) return [];
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("category", category as "machine_operation" | "machine_maintenance" | "sop_training")
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id && !!category,
  });

  // Fetch archived checklists
  const { data: archivedChecklists, refetch: refetchArchived } = useQuery({
    queryKey: ["checklists-archived", category, organization?.id],
    queryFn: async () => {
      if (!organization?.id || !category) return [];
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("category", category as "machine_operation" | "machine_maintenance" | "sop_training")
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id && !!category,
  });

  // Filter and sort checklists
  const filteredAndSortedChecklists = useMemo(() => {
    if (!checklists) return [];
    
    let result = checklists.filter((checklist) =>
      checklist.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    switch (sortOption) {
      case "alphabetical":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "oldest":
        result = [...result].sort((a, b) => 
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );
        break;
      case "recent":
      default:
        result = [...result].sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }
    
    return result;
  }, [checklists, searchQuery, sortOption]);

  const deleteMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      toast({ title: "Checklist deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedChecklist(null);
    },
    onError: (error) => {
      toast({ title: "Failed to delete checklist", description: error.message, variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from("checklists")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", checklistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      toast({ title: "Checklist archived successfully" });
      setArchiveDialogOpen(false);
      setSelectedChecklist(null);
    },
    onError: (error) => {
      toast({ title: "Failed to archive checklist", description: error.message, variant: "destructive" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from("checklists")
        .update({ archived_at: null })
        .eq("id", checklistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      toast({ title: "Checklist restored successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to restore checklist", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title: string; description: string | null }) => {
      const { error } = await supabase
        .from("checklists")
        .update({ title, description })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      toast({ title: "Checklist updated successfully" });
      setEditDialogOpen(false);
      setEditingChecklist(null);
    },
    onError: (error) => {
      toast({ title: "Failed to update checklist", description: error.message, variant: "destructive" });
    },
  });

  const handleChecklistClick = (checklistId: string) => {
    navigate(`/dashboard/${orgSlug}/training/${category}/${checklistId}`);
  };

  const handleEdit = (e: React.MouseEvent, checklist: { id: string; title: string; description: string | null }) => {
    e.stopPropagation();
    setEditingChecklist(checklist);
    setEditTitle(checklist.title);
    setEditDescription(checklist.description || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingChecklist || !editTitle.trim()) return;
    updateMutation.mutate({
      id: editingChecklist.id,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
    });
  };

  const handleArchive = (e: React.MouseEvent, checklist: { id: string; title: string }) => {
    e.stopPropagation();
    setSelectedChecklist(checklist);
    setArchiveDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, checklist: { id: string; title: string }) => {
    e.stopPropagation();
    setSelectedChecklist(checklist);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation();
    restoreMutation.mutate(checklistId);
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
              {categoryLabel}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage checklists and documentation for {categoryLabel.toLowerCase()}.
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Checklist
            </Button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search checklists..."
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

        {/* Checklists list */}
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
        ) : filteredAndSortedChecklists && filteredAndSortedChecklists.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedChecklists.map((checklist) => (
              <Card 
                key={checklist.id}
                className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                onClick={() => handleChecklistClick(checklist.id)}
              >
                <CardHeader className={checklist.description ? "pb-2" : ""}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {checklist.title}
                        {checklist.is_locked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                    </div>
                    {/* Action buttons - only visible to admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleEdit(e, { id: checklist.id, title: checklist.title, description: checklist.description })}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleArchive(e, { id: checklist.id, title: checklist.title })}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(e, { id: checklist.id, title: checklist.title })}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {checklist.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {checklist.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : checklists && checklists.length > 0 && filteredAndSortedChecklists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No matching checklists
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                No checklists match your search query "{searchQuery}".
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No checklists yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {isAdmin 
                  ? "Create your first checklist to get started."
                  : "No checklists have been created for this category yet."
                }
              </p>
              {isAdmin && (
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Checklist
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Archived Checklists Dropdown */}
        {archivedChecklists && archivedChecklists.length > 0 && (
          <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen} className="mt-8">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived ({archivedChecklists.length})
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${archivedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              {archivedChecklists.map((checklist) => (
                <Card 
                  key={checklist.id}
                  className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md opacity-70"
                  onClick={() => handleChecklistClick(checklist.id)}
                >
                  <CardHeader className={checklist.description ? "pb-2" : ""}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Archive className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                          {checklist.title}
                        </CardTitle>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleRestore(e, checklist.id)}
                            title="Restore"
                          >
                            <ArchiveRestore className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(e, { id: checklist.id, title: checklist.title })}
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {checklist.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {checklist.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Create Checklist Dialog */}
      <CreateChecklistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        category={category as "machine_operation" | "machine_maintenance" | "sop_training"}
        onSuccess={() => {
          refetch();
          setCreateDialogOpen(false);
        }}
      />

      {/* Edit Checklist Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Checklist</DialogTitle>
            <DialogDescription>
              Update the title and description for this checklist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Checklist title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this checklist"
                rows={3}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedChecklist?.title}"? This action cannot be undone and will permanently remove all sections and items within this checklist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedChecklist && deleteMutation.mutate(selectedChecklist.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Checklist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{selectedChecklist?.title}"? Archived checklists will be hidden from the main list but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedChecklist && archiveMutation.mutate(selectedChecklist.id)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CategoryDocuments;
