import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeLogos } from "@/hooks/useThemeLogos";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateChecklistDialog } from "@/components/training/CreateChecklistDialog";
import { format } from "date-fns";

const categoryLabels: Record<string, string> = {
  machine_operation: "Machine Operation",
  machine_maintenance: "Machine Maintenance",
  sop_training: "SOP/Training",
};

const CategoryDocuments = () => {
  const { category, orgSlug } = useParams<{ category: string; orgSlug: string }>();
  const { organization, isAdmin } = useAuth();
  const { mainLogoUrl } = useThemeLogos();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const categoryLabel = categoryLabels[category || ""] || category;

  const { data: checklists, isLoading, refetch } = useQuery({
    queryKey: ["checklists", category, organization?.id],
    queryFn: async () => {
      if (!organization?.id || !category) return [];
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("category", category as "machine_operation" | "machine_maintenance" | "sop_training")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id && !!category,
  });

  const handleChecklistClick = (checklistId: string) => {
    navigate(`/dashboard/${orgSlug}/training/${category}/${checklistId}`);
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
        ) : checklists && checklists.length > 0 ? (
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <Card 
                key={checklist.id}
                className="group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                onClick={() => handleChecklistClick(checklist.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {checklist.title}
                          {checklist.is_locked && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(checklist.updated_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {checklist.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
    </DashboardLayout>
  );
};

export default CategoryDocuments;
