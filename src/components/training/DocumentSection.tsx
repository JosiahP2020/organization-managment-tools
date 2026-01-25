import { useState } from "react";
import { Search, Plus, Pencil, Archive, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTrainingDocuments } from "@/hooks/useTrainingDocuments";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { EditDocumentDialog } from "./EditDocumentDialog";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";
import { ArchiveDocumentDialog } from "./ArchiveDocumentDialog";
import type { DocumentCategory } from "@/pages/training/SOPTraining";

interface DocumentSectionProps {
  title: string;
  category: DocumentCategory;
}

export function DocumentSection({ title, category }: DocumentSectionProps) {
  const { isAdmin } = useAuth();
  const { documents, isLoading, refetch } = useTrainingDocuments(category);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<{ id: string; title: string } | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<{ id: string; title: string } | null>(null);
  const [archivingDocument, setArchivingDocument] = useState<{ id: string; title: string } | null>(null);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground text-center">
        {title}:
      </h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create Button - Admin only, compact width */}
      {isAdmin && (
        <div className="flex justify-center">
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchQuery ? "No documents found" : "No documents yet"}
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Card 
              key={doc.id} 
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <span className="text-foreground truncate flex-1 min-w-0">{doc.title}</span>

              {isAdmin && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingDocument({ id: doc.id, title: doc.title })}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setArchivingDocument({ id: doc.id, title: doc.title })}
                    title="Archive"
                  >
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingDocument({ id: doc.id, title: doc.title })}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <CreateDocumentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        category={category}
        onSuccess={refetch}
      />

      {editingDocument && (
        <EditDocumentDialog
          open={!!editingDocument}
          onOpenChange={(open) => !open && setEditingDocument(null)}
          documentId={editingDocument.id}
          currentTitle={editingDocument.title}
          onSuccess={refetch}
        />
      )}

      {archivingDocument && (
        <ArchiveDocumentDialog
          open={!!archivingDocument}
          onOpenChange={(open) => !open && setArchivingDocument(null)}
          documentId={archivingDocument.id}
          documentTitle={archivingDocument.title}
          onSuccess={refetch}
        />
      )}

      {deletingDocument && (
        <DeleteDocumentDialog
          open={!!deletingDocument}
          onOpenChange={(open) => !open && setDeletingDocument(null)}
          documentId={deletingDocument.id}
          documentTitle={deletingDocument.title}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
