import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { useDriveExport } from "@/hooks/useDriveExport";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { GembaDocSidebar } from "@/components/training/GembaDocSidebar";
import { GembaDocGrid } from "@/components/training/GembaDocGrid";
import { GembaDocPrintView } from "@/components/training/GembaDocPrintView";
import { ImageAnnotationModal, type DrawingAction } from "@/components/training/ImageAnnotationModal";
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
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";


function GembaDocEditorContent() {
  const { gembaDocId, orgSlug, category } = useParams<{
    gembaDocId: string;
    orgSlug: string;
    category: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { subLogoUrl } = useThemeLogos();
  const { syncToDriveIfNeeded } = useDriveExport();
  const printRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [doubleSided, setDoubleSided] = useState(false);
  const [uploadingPositions, setUploadingPositions] = useState<number[]>([]);
  const [annotatingCell, setAnnotatingCell] = useState<{
    position: number;
    imageUrl: string;
    annotations: DrawingAction[];
  } | null>(null);
  const [deletePageDialogOpen, setDeletePageDialogOpen] = useState(false);
  
  
  // Local state for title and description with debounced saving
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch gemba doc
  const { data: gembaDoc, isLoading: docLoading } = useQuery({
    queryKey: ["gemba-doc", gembaDocId],
    queryFn: async () => {
      if (!gembaDocId) return null;
      const { data, error } = await supabase
        .from("gemba_docs")
        .select("*")
        .eq("id", gembaDocId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!gembaDocId,
  });

  // Fetch pages
  const { data: pages, refetch: refetchPages } = useQuery({
    queryKey: ["gemba-doc-pages", gembaDocId],
    queryFn: async () => {
      if (!gembaDocId) return [];
      const { data, error } = await supabase
        .from("gemba_doc_pages")
        .select("*")
        .eq("gemba_doc_id", gembaDocId)
        .order("page_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!gembaDocId,
  });

  // Fetch cells for current page
  const currentPageData = pages?.find((p) => p.page_number === currentPage);
  const { data: cells, refetch: refetchCells } = useQuery({
    queryKey: ["gemba-doc-cells", currentPageData?.id],
    queryFn: async () => {
      if (!currentPageData?.id) return [];
      const { data, error } = await supabase
        .from("gemba_doc_cells")
        .select("*")
        .eq("page_id", currentPageData.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!currentPageData?.id,
  });

  // Update doc mutation
  const updateDocMutation = useMutation({
    mutationFn: async (updates: {
      title?: string;
      description?: string | null;
      orientation?: string;
      grid_rows?: number;
      grid_columns?: number;
      is_locked?: boolean;
    }) => {
      if (!gembaDocId) throw new Error("No doc ID");
      const { error } = await supabase
        .from("gemba_docs")
        .update(updates)
        .eq("id", gembaDocId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gemba-doc", gembaDocId] });
      if (gembaDocId) syncToDriveIfNeeded("gemba_doc", gembaDocId);
    },
    onError: (error) => {
      toast({
        title: "Failed to update document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upsert cell mutation
  const upsertCellMutation = useMutation({
    mutationFn: async ({
      position,
      updates,
    }: {
      position: number;
      updates: Partial<{
        image_url: string | null;
        image_annotations: Json | null;
        step_number: string | null;
        step_text: string | null;
      }>;
    }) => {
      if (!currentPageData?.id) throw new Error("No page");

      // Check if cell exists
      const existingCell = cells?.find((c) => c.position === position);

      if (existingCell) {
        const { error } = await supabase
          .from("gemba_doc_cells")
          .update(updates)
          .eq("id", existingCell.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gemba_doc_cells").insert({
          page_id: currentPageData.id,
          position,
          image_url: updates.image_url ?? null,
          image_annotations: updates.image_annotations ?? null,
          step_number: updates.step_number ?? null,
          step_text: updates.step_text ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetchCells();
      if (gembaDocId) syncToDriveIfNeeded("gemba_doc", gembaDocId);
    },
    onError: (error) => {
      toast({
        title: "Failed to update cell",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add page mutation
  const addPageMutation = useMutation({
    mutationFn: async () => {
      if (!gembaDocId || !pages) throw new Error("Missing data");
      const nextPageNumber = (pages.length || 0) + 1;
      const { error } = await supabase.from("gemba_doc_pages").insert({
        gemba_doc_id: gembaDocId,
        page_number: nextPageNumber,
      });
      if (error) throw error;
      return nextPageNumber;
    },
    onSuccess: (newPageNumber) => {
      refetchPages();
      setCurrentPage(newPageNumber);
      toast({ title: "New page added" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add page",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async () => {
      if (!currentPageData?.id) throw new Error("No page");
      const { error } = await supabase
        .from("gemba_doc_pages")
        .delete()
        .eq("id", currentPageData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPages();
      setCurrentPage(Math.max(1, currentPage - 1));
      setDeletePageDialogOpen(false);
      toast({ title: "Page deleted" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete page",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const handleCellImageUpload = useCallback(
    async (position: number, file: File) => {
      if (!gembaDocId) return;

      setUploadingPositions((prev) => [...prev, position]);

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${gembaDocId}/${currentPage}-${position}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("training-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("training-documents").getPublicUrl(fileName);

        await upsertCellMutation.mutateAsync({
          position,
          updates: { image_url: publicUrl },
        });

        toast({ title: "Image uploaded" });
      } catch (error: unknown) {
        toast({
          title: "Failed to upload image",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setUploadingPositions((prev) => prev.filter((p) => p !== position));
      }
    },
    [gembaDocId, currentPage, upsertCellMutation]
  );

  // Handle image delete
  const handleCellImageDelete = useCallback(
    async (position: number) => {
      await upsertCellMutation.mutateAsync({
        position,
        updates: { image_url: null, image_annotations: null },
      });
      toast({ title: "Image deleted" });
    },
    [upsertCellMutation]
  );

  // Handle annotation
  const handleCellAnnotate = useCallback(
    (position: number) => {
      const cell = cells?.find((c) => c.position === position);
      if (!cell?.image_url) return;

      setAnnotatingCell({
        position,
        imageUrl: cell.image_url,
        annotations: (cell.image_annotations as unknown as DrawingAction[]) || [],
      });
    },
    [cells]
  );

  // Save annotations
  const handleSaveAnnotations = useCallback(
    async (annotations: DrawingAction[]) => {
      if (!annotatingCell) return;

      await upsertCellMutation.mutateAsync({
        position: annotatingCell.position,
        updates: { image_annotations: annotations as unknown as Json },
      });

      setAnnotatingCell(null);
      toast({ title: "Annotations saved" });
    },
    [annotatingCell, upsertCellMutation]
  );

  // Handle step text change (step numbers are now auto-generated)
  const handleStepTextChange = useCallback(
    (position: number, value: string) => {
      upsertCellMutation.mutate({
        position,
        updates: { step_text: value || null },
      });
    },
    [upsertCellMutation]
  );

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle title/description change
  const handleTitleChange = useCallback(
    (value: string) => {
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current);
      }
      titleDebounceRef.current = setTimeout(() => {
        updateDocMutation.mutate({ title: value });
      }, 500);
    },
    [updateDocMutation]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      if (descriptionDebounceRef.current) {
        clearTimeout(descriptionDebounceRef.current);
      }
      descriptionDebounceRef.current = setTimeout(() => {
        updateDocMutation.mutate({ description: value || null });
      }, 500);
    },
    [updateDocMutation]
  );
  
  // Sync local state when gembaDoc loads/changes
  useEffect(() => {
    if (gembaDoc) {
      setLocalTitle(gembaDoc.title);
      setLocalDescription(gembaDoc.description || "");
    }
  }, [gembaDoc?.id]); // Only sync on initial load, not every update
  
  // Cleanup debounce timeouts
  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
      if (descriptionDebounceRef.current) clearTimeout(descriptionDebounceRef.current);
    };
  }, []);

  if (docLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!gembaDoc) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Document not found</h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(`/dashboard/${orgSlug}/training/${category}`)}
          >
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isLocked = gembaDoc.is_locked ?? false;
  const canEdit = isAdmin && !isLocked;
  const totalPages = pages?.length || 1;
  const gridRows = gembaDoc.grid_rows;
  const gridCols = gembaDoc.grid_columns;
  const orientation = gembaDoc.orientation as "portrait" | "landscape";

  // Prepare print data
  const printPages =
    pages?.map((page) => ({
      page_number: page.page_number,
      cells: (cells || [])
        .filter((c) => c.page_id === page.id)
        .map((c) => ({
          position: c.position,
          image_url: c.image_url,
          image_annotations: c.image_annotations as object[] | null,
          step_number: c.step_number,
          step_text: c.step_text,
        })),
    })) || [];

  return (
    <>
      {/* Print view - OUTSIDE DashboardLayout so no header/menu/back button */}
      <div className="hidden print:block print:p-0 print:m-0">
        <GembaDocPrintView
          ref={printRef}
          title={gembaDoc.title}
          description={gembaDoc.description}
          logoUrl={subLogoUrl}
          pages={printPages}
          gridRows={gridRows}
          gridCols={gridCols}
          orientation={orientation}
        />
      </div>

      {/* Screen view (hidden on print) */}
      <div className="print:hidden">
        <DashboardLayout>
          <div className="relative">
            {/* Sidebar - Positioned absolutely on the left, aligned with grid top */}
            <div className="absolute left-0 top-[10.5rem]">
              <GembaDocSidebar
                isLocked={isLocked}
                onLockChange={(locked) => updateDocMutation.mutate({ is_locked: locked })}
                orientation={orientation}
                onOrientationChange={(o) => updateDocMutation.mutate({ orientation: o })}
                gridRows={gridRows}
                gridCols={gridCols}
                onGridChange={(rows, cols) =>
                  updateDocMutation.mutate({ grid_rows: rows, grid_columns: cols })
                }
                doubleSided={doubleSided}
                onDoubleSidedChange={setDoubleSided}
                onPrint={handlePrint}
                isAdmin={isAdmin}
              />
            </div>

            {/* Main content - centered */}
            <div className="max-w-4xl mx-auto">
              {/* Header: Sub-logo left, Title centered */}
              <div className="relative flex items-start mb-8">
                {/* Sub-logo on the left */}
                <div className="flex-shrink-0">
                  {subLogoUrl ? (
                    <img 
                      src={subLogoUrl} 
                      alt="Organization Logo" 
                      className="h-16 md:h-20 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-16 md:h-20 w-16 md:w-20 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">Logo</span>
                    </div>
                  )}
                </div>

                {/* Centered title and description */}
                <div className="flex-1 text-center">
                  {canEdit ? (
                    <Input
                      value={localTitle}
                      onChange={(e) => {
                        setLocalTitle(e.target.value);
                        handleTitleChange(e.target.value);
                      }}
                      className="text-2xl md:text-3xl font-bold text-center border-none bg-transparent h-auto py-1 text-foreground"
                      placeholder="Document Title"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {gembaDoc.title}
                    </h1>
                  )}
                  {canEdit ? (
                    <Textarea
                      value={localDescription}
                      onChange={(e) => {
                        setLocalDescription(e.target.value);
                        handleDescriptionChange(e.target.value);
                      }}
                      className="text-muted-foreground text-center border-none bg-transparent resize-none mt-1"
                      placeholder="Add a description..."
                      rows={1}
                    />
                  ) : (
                    gembaDoc.description && (
                      <p className="text-muted-foreground mt-1">
                        {gembaDoc.description}
                      </p>
                    )
                  )}
                </div>

                {/* Spacer for symmetry */}
                <div className="flex-shrink-0 w-16 md:w-20" />
              </div>

              {/* Grid content */}
              <div className="space-y-4">
                <GembaDocGrid
                  cells={
                    cells?.map((c) => ({
                      id: c.id,
                      position: c.position,
                      image_url: c.image_url,
                      image_annotations: c.image_annotations as object[] | null,
                      step_text: c.step_text,
                    })) || []
                  }
                  gridRows={gridRows}
                  gridCols={gridCols}
                  isLocked={isLocked}
                  isAdmin={isAdmin}
                  onCellImageUpload={handleCellImageUpload}
                  onCellImageDelete={handleCellImageDelete}
                  onCellAnnotate={handleCellAnnotate}
                  onCellStepTextChange={handleStepTextChange}
                  uploadingPositions={uploadingPositions}
                />

                {/* Page Navigation */}
                <div className="flex items-center justify-center gap-4 py-4 border-t">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {canEdit && currentPage === totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPageMutation.mutate()}
                      disabled={addPageMutation.isPending}
                      className="ml-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Page
                    </Button>
                  )}

                  {canEdit && totalPages > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletePageDialogOpen(true)}
                      className="ml-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Page
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Annotation Modal */}
          {annotatingCell && (
            <ImageAnnotationModal
              open={!!annotatingCell}
              onOpenChange={(open) => !open && setAnnotatingCell(null)}
              imageUrl={annotatingCell.imageUrl}
              initialAnnotations={annotatingCell.annotations}
              onSave={handleSaveAnnotations}
            />
          )}

          {/* Delete Page Confirmation */}
          <AlertDialog open={deletePageDialogOpen} onOpenChange={setDeletePageDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Page</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete page {currentPage}? All content on this
                  page will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deletePageMutation.mutate()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DashboardLayout>
      </div>
    </>
  );
}

export default GembaDocEditorContent;
