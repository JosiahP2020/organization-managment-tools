import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Widget } from "@/hooks/useWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin, FileText, CheckSquare, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PinnedItemsWidgetProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
}

export function PinnedItemsWidget({ widget }: PinnedItemsWidgetProps) {
  const { organization, user } = useAuth();
  const navigate = useNavigate();
  const limit = widget.config.limit || 10;

  const { data: pinnedItems = [], isLoading } = useQuery({
    queryKey: ["pinned-items", organization?.id, user?.id, limit],
    queryFn: async () => {
      if (!organization?.id || !user?.id) return [];

      const { data, error } = await supabase
        .from("pinned_items")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("user_id", user.id)
        .order("pinned_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id && !!user?.id,
  });

  const getIcon = (documentType: string) => {
    switch (documentType) {
      case "checklist":
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case "sop_guide":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleItemClick = (item: { document_type: string; document_id: string }) => {
    if (!organization?.slug) return;
    const basePath = `/dashboard/${organization.slug}`;

    switch (item.document_type) {
      case "checklist":
        navigate(`${basePath}/training/checklist/${item.document_id}`);
        break;
      case "sop_guide":
        navigate(`${basePath}/training/guide/${item.document_id}`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Pin className="h-5 w-5" />
            {widget.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Pin className="h-5 w-5" />
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pinnedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pinned items
          </p>
        ) : (
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {getIcon(item.document_type)}
                <span className="text-sm font-medium truncate">
                  {item.document_type} • {item.document_id.slice(0, 8)}...
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
