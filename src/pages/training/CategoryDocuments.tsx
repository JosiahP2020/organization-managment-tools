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
import { Plus, FileText, Lock, Search, Pencil, Archive, Trash2, ArrowUpDown, ChevronDown, ArchiveRestore, Grid3X3, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateChecklistDialog } from "@/components/training/CreateChecklistDialog";
import { CreateDocumentTypeDialog } from "@/components/training/CreateDocumentTypeDialog";
import { CreateGembaDocDialog } from "@/components/training/CreateGembaDocDialog";
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
  sop_training: "SOP",
};

type SortOption = "recent" | "oldest" | "alphabetical";

const sortLabels: Record<SortOption, string> = {
  recent: "Recently Updated",
  oldest: "Oldest First",
  alphabetical: "Alphabetically",
};

type DocumentItem = {
  id: string;
  title: string;
  description: string | null;
  is_locked: boolean | null;
  updated_at: string | null;
  type: "checklist" | "gemba";
};

const CategoryDocuments = () => {
  const { category, orgSlug } = useParams<{ category: string; orgSlug: string }>();
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [documentTypeDialogOpen, setDocumentTypeDialogOpen] = useState(false);
  const [createChecklistDialogOpen, setCreateChecklistDialogOpen] = useState(false);
  const [createGembaDialogOpen, setCreateGembaDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const categoryLabel = categoryLabels[category || ""] || category;

  // Fetch active checklists
  const { data: checklists, isLoading: checklistsLoading, refetch: refetchChecklists } = useQuery({
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

  // Fetch active gemba docs
  const { data: gembaDocs, isLoading: gembaLoading, refetch: refetchGemba } = useQuery({
    queryKey: ["gemba-docs", category, organization?.id],
    queryFn: async () => {
      if (!organization?.id || !category) return [];
      
      const { data, error } = await supabase
        .from("gemba_docs")
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
  const { data: archivedChecklists } = useQuery({
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

  // Fetch archived gemba docs
  const { data: archivedGembaDocs } = useQuery({
    queryKey: ["gemba-docs-archived", category, organization?.id],
    queryFn: async () => {
      if (!organization?.id || !category) return [];
      
      const { data, error } = await supabase
        .from("gemba_docs")
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

  const isLoading = checklistsLoading || gembaLoading;

  // Combine all documents
  const allDocuments: DocumentItem[] = useMemo(() => {
    const checklistItems: DocumentItem[] = (checklists || []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      is_locked: c.is_locked,
      updated_at: c.updated_at,
      type: "checklist" as const,
    }));
    
    const gembaItems: DocumentItem[] = (gembaDocs || []).map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      is_locked: g.is_locked,
      updated_at: g.updated_at,
      type: "gemba" as const,
    }));
    
    return [...checklistItems, ...gembaItems];
  }, [checklists, gembaDocs]);

  const archivedDocuments: DocumentItem[] = useMemo(() => {
    const checklistItems: DocumentItem[] = (archivedChecklists || []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      is_locked: c.is_locked,
      updated_at: c.updated_at,
      type: "checklist" as const,
    }));
    
    const gembaItems: DocumentItem[] = (archivedGembaDocs || []).map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      is_locked: g.is_locked,
      updated_at: g.updated_at,
      type: "gemba" as const,
    }));
    
    return [...checklistItems, ...gembaItems];
  }, [archivedChecklists, archivedGembaDocs]);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let result = allDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [allDocuments, searchQuery, sortOption]);

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "checklist" | "gemba" }) => {
      const table = type === "checklist" ? "checklists" : "gemba_docs";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs-archived"] });
      toast({ title: "Document deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({ title: "Failed to delete document", description: error.message, variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "checklist" | "gemba" }) => {
      const table = type === "checklist" ? "checklists" : "gemba_docs";
      const { error } = await supabase
        .from(table)
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs-archived"] });
      toast({ title: "Document archived successfully" });
      setArchiveDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({ title: "Failed to archive document", description: error.message, variant: "destructive" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "checklist" | "gemba" }) => {
      const table = type === "checklist" ? "checklists" : "gemba_docs";
      const { error } = await supabase
        .from(table)
        .update({ archived_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs-archived"] });
      toast({ title: "Document restored successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to restore document", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, type, title, description }: { id: string; type: "checklist" | "gemba"; title: string; description: string | null }) => {
      const table = type === "checklist" ? "checklists" : "gemba_docs";
      const { error } = await supabase
        .from(table)
        .update({ title, description })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-archived"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs"] });
      queryClient.invalidateQueries({ queryKey: ["gemba-docs-archived"] });
      toast({ title: "Document updated successfully" });
      setEditDialogOpen(false);
      setEditingDocument(null);
    },
    onError: (error) => {
      toast({ title: "Failed to update document", description: error.message, variant: "destructive" });
    },
  });

  const handleDocumentClick = (doc: DocumentItem) => {
    if (doc.type === "checklist") {
      navigate(`/dashboard/${orgSlug}/training/${category}/${doc.id}`);
    } else {
      navigate(`/dashboard/${orgSlug}/training/${category}/gemba/${doc.id}`);
    }
  };

  const handleDocumentTypeSelect = (type: "checklist" | "gemba") => {
    if (type === "checklist") {
      setCreateChecklistDialogOpen(true);
    } else {
      setCreateGembaDialogOpen(true);
    }
  };

  const handleEdit = (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    setEditingDocument(doc);
    setEditTitle(doc.title);
    setEditDescription(doc.description || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDocument || !editTitle.trim()) return;
    updateMutation.mutate({
      id: editingDocument.id,
      type: editingDocument.type,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
    });
  };

  const handleArchive = (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    setSelectedDocument(doc);
    setArchiveDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    restoreMutation.mutate({ id: doc.id, type: doc.type });
  };

  const getDocumentIcon = (type: "checklist" | "gemba") => {
    return type === "checklist" ? CheckSquare : Grid3X3;
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
            <Button onClick={() => setDocumentTypeDialogOpen(true)} className="gap-2">
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
              placeholder="Search documents..."
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

        {/* Documents list */}
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
        ) : filteredAndSortedDocuments.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedDocuments.map((doc) => {
              const Icon = getDocumentIcon(doc.type);
              return (
                <Card 
                  key={`${doc.type}-${doc.id}`}
                  className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                  onClick={() => handleDocumentClick(doc)}
                >
                  <CardHeader className={doc.description ? "pb-2" : ""}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {doc.title}
                            {doc.is_locked && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {doc.type === "checklist" ? "Checklist" : "SOP Guide"}
                          </span>
                        </div>
                      </div>
                      {/* Action buttons - only visible to admin */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleEdit(e, doc)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleArchive(e, doc)}
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(e, doc)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {doc.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : allDocuments.length > 0 && filteredAndSortedDocuments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No matching documents
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                No documents match your search query "{searchQuery}".
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No documents yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {isAdmin 
                  ? "Create your first document to get started."
                  : "No documents have been created for this category yet."
                }
              </p>
              {isAdmin && (
                <Button onClick={() => setDocumentTypeDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Archived Documents Dropdown */}
        {archivedDocuments.length > 0 && (
          <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen} className="mt-8">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived ({archivedDocuments.length})
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${archivedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              {archivedDocuments.map((doc) => {
                const Icon = getDocumentIcon(doc.type);
                return (
                  <Card 
                    key={`archived-${doc.type}-${doc.id}`}
                    className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md opacity-70"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <CardHeader className={doc.description ? "pb-2" : ""}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                              {doc.title}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {doc.type === "checklist" ? "Checklist" : "SOP Guide"}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleRestore(e, doc)}
                              title="Restore"
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => handleDelete(e, doc)}
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {doc.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {doc.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Document Type Selection Dialog */}
      <CreateDocumentTypeDialog
        open={documentTypeDialogOpen}
        onOpenChange={setDocumentTypeDialogOpen}
        onSelectType={handleDocumentTypeSelect}
      />

      {/* Create Checklist Dialog */}
      <CreateChecklistDialog
        open={createChecklistDialogOpen}
        onOpenChange={setCreateChecklistDialogOpen}
        category={category as "machine_operation" | "machine_maintenance" | "sop_training"}
        onSuccess={() => {
          refetchChecklists();
          setCreateChecklistDialogOpen(false);
        }}
      />

      {/* Create Gemba Doc Dialog */}
      <CreateGembaDocDialog
        open={createGembaDialogOpen}
        onOpenChange={setCreateGembaDialogOpen}
        category={category as "machine_operation" | "machine_maintenance" | "sop_training"}
        onSuccess={(gembaDocId) => {
          refetchGemba();
          setCreateGembaDialogOpen(false);
          navigate(`/dashboard/${orgSlug}/training/${category}/gemba/${gembaDocId}`);
        }}
      />

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the title and description for this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this document"
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
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.title}"? This action cannot be undone and will permanently remove all content within this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedDocument && deleteMutation.mutate({ id: selectedDocument.id, type: selectedDocument.type })}
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
            <AlertDialogTitle>Archive Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{selectedDocument?.title}"? Archived documents will be hidden from the main list but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedDocument && archiveMutation.mutate({ id: selectedDocument.id, type: selectedDocument.type })}
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
