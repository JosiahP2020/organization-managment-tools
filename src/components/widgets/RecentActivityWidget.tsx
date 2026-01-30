import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, CheckSquare, Upload } from "lucide-react";
import type { WidgetSize } from "@/types/widgets";

interface RecentActivityWidgetProps {
  size?: WidgetSize;
}

// Placeholder activity - will be replaced with real data from activity_log table
const placeholderActivity = [
  { 
    id: "1", 
    action: "created", 
    entity: "Safety Checklist", 
    type: "checklist",
    user: "John D.", 
    time: "2 min ago" 
  },
  { 
    id: "2", 
    action: "updated", 
    entity: "Machine SOP Guide", 
    type: "document",
    user: "Sarah M.", 
    time: "15 min ago" 
  },
  { 
    id: "3", 
    action: "completed", 
    entity: "Training Module 3", 
    type: "checklist",
    user: "Mike R.", 
    time: "1 hour ago" 
  },
  { 
    id: "4", 
    action: "uploaded", 
    entity: "Equipment Manual", 
    type: "file",
    user: "Lisa K.", 
    time: "2 hours ago" 
  },
];

const getActionIcon = (type: string) => {
  switch (type) {
    case "checklist":
      return CheckSquare;
    case "document":
      return FileText;
    case "file":
      return Upload;
    default:
      return Activity;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "created":
      return "text-green-500";
    case "updated":
      return "text-blue-500";
    case "completed":
      return "text-primary";
    case "uploaded":
      return "text-orange-500";
    default:
      return "text-muted-foreground";
  }
};

export function RecentActivityWidget({ size = "medium" }: RecentActivityWidgetProps) {
  const isSmall = size === "small";
  const displayItems = isSmall ? placeholderActivity.slice(0, 3) : placeholderActivity;

  return (
    <Card className="bg-card border-border">
      <CardHeader className={isSmall ? "p-3 pb-2" : "p-4 pb-3"}>
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className={isSmall ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className="space-y-3">
          {displayItems.map((item) => {
            const Icon = getActionIcon(item.type);
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${getActionColor(item.action)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-medium">{item.user}</span>{" "}
                    <span className={getActionColor(item.action)}>{item.action}</span>{" "}
                    <span className="text-muted-foreground">{item.entity}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        {!isSmall && (
          <button className="w-full mt-3 text-xs text-primary hover:underline">
            View all activity
          </button>
        )}
      </CardContent>
    </Card>
  );
}
