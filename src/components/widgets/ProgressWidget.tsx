import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Widget } from "@/hooks/useWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, CheckCircle } from "lucide-react";

interface ProgressWidgetProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
}

export function ProgressWidget({ widget }: ProgressWidgetProps) {
  const { organization } = useAuth();

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["progress-stats", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return { completed: 0, total: 0 };

      // Get total checklists
      const { count: totalCount } = await supabase
        .from("checklists")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .is("archived_at", null);

      // For now, we'll estimate completion based on locked status
      const { count: completedCount } = await supabase
        .from("checklists")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("is_locked", true)
        .is("archived_at", null);

      return {
        completed: completedCount || 0,
        total: totalCount || 0,
      };
    },
    enabled: !!organization?.id,
  });

  const percentage = progressData?.total 
    ? Math.round((progressData.completed / progressData.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {widget.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{progressData?.completed || 0} completed</span>
          </div>
          <span className="text-muted-foreground">
            of {progressData?.total || 0} total
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
