import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Widget } from "@/hooks/useWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, CheckSquare, BookOpen, FileText } from "lucide-react";

interface DocumentStatsWidgetProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
}

export function DocumentStatsWidget({ widget }: DocumentStatsWidgetProps) {
  const { organization } = useAuth();
  const showChecklists = widget.config.show_checklists !== false;
  const showGuides = widget.config.show_guides !== false;
  const showFiles = widget.config.show_files !== false;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["document-stats", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return { checklists: 0, guides: 0, files: 0 };

      const [checklistsRes, guidesRes, filesRes] = await Promise.all([
        supabase
          .from("checklists")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organization.id)
          .is("archived_at", null),
        supabase
          .from("gemba_docs")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organization.id)
          .is("archived_at", null),
        supabase
          .from("training_documents")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organization.id)
          .is("archived_at", null),
      ]);

      return {
        checklists: checklistsRes.count || 0,
        guides: guidesRes.count || 0,
        files: filesRes.count || 0,
      };
    },
    enabled: !!organization?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {widget.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayType = widget.config.display_type || "counter";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayType === "counter" ? (
          <div className="grid grid-cols-3 gap-4">
            {showChecklists && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <CheckSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.checklists || 0}
                </p>
                <p className="text-xs text-muted-foreground">Checklists</p>
              </div>
            )}
            {showGuides && (
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.guides || 0}
                </p>
                <p className="text-xs text-muted-foreground">SOP Guides</p>
              </div>
            )}
            {showFiles && (
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats?.files || 0}
                </p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {showChecklists && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                  <span>Checklists</span>
                </div>
                <span className="font-bold">{stats?.checklists || 0}</span>
              </div>
            )}
            {showGuides && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <span>SOP Guides</span>
                </div>
                <span className="font-bold">{stats?.guides || 0}</span>
              </div>
            )}
            {showFiles && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <span>Documents</span>
                </div>
                <span className="font-bold">{stats?.files || 0}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
