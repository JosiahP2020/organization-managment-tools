import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertCircle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WidgetSize } from "@/types/widgets";

interface NotificationsWidgetProps {
  size?: WidgetSize;
}

// Placeholder notifications - will be replaced with real data
const placeholderNotifications = [
  { 
    id: "1", 
    type: "alert",
    title: "Safety training due", 
    message: "Complete by end of week",
    time: "1h ago",
    read: false,
  },
  { 
    id: "2", 
    type: "info",
    title: "New SOP published", 
    message: "Machine Operation Guide v2",
    time: "3h ago",
    read: false,
  },
  { 
    id: "3", 
    type: "success",
    title: "Checklist approved", 
    message: "Quality Inspection Checklist",
    time: "Yesterday",
    read: true,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "alert":
      return AlertCircle;
    case "success":
      return CheckCircle;
    default:
      return Info;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "alert":
      return "text-red-500 bg-red-500/10";
    case "success":
      return "text-green-500 bg-green-500/10";
    default:
      return "text-blue-500 bg-blue-500/10";
  }
};

export function NotificationsWidget({ size = "small" }: NotificationsWidgetProps) {
  const isSmall = size === "small";
  const displayNotifications = isSmall 
    ? placeholderNotifications.slice(0, 2) 
    : placeholderNotifications;

  const unreadCount = placeholderNotifications.filter(n => !n.read).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className={isSmall ? "p-3 pb-2" : "p-4 pb-3"}>
        <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {unreadCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={isSmall ? "p-3 pt-0" : "p-4 pt-0"}>
        {displayNotifications.length === 0 ? (
          <div className="text-center py-4">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayNotifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              const colorClass = getTypeColor(notification.type);
              
              return (
                <div 
                  key={notification.id} 
                  className={`flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        {!isSmall && unreadCount > 0 && (
          <button className="w-full mt-3 text-xs text-primary hover:underline">
            Mark all as read
          </button>
        )}
      </CardContent>
    </Card>
  );
}
