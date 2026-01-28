import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Widget } from "@/hooks/useWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileText, CheckSquare, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityWidgetProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
}

export function RecentActivityWidget({ widget }: RecentActivityWidgetProps) {
  const { organization } = useAuth();
  const limit = widget.config.limit || 10;

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity-log", organization?.id, limit],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case "checklist":
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case "sop_guide":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case "created":
        return "Created";
      case "updated":
        return "Updated";
      case "completed":
        return "Completed";
      case "viewed":
        return "Viewed";
      case "deleted":
        return "Deleted";
      case "archived":
        return "Archived";
      default:
        return actionType;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {widget.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">{getIcon(activity.entity_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getActionText(activity.action_type)} {activity.entity_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
