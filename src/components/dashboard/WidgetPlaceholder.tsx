import { Clock, BarChart3, Bell, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddWidgetButton } from "./AddWidgetButton";

interface WidgetPlaceholderProps {
  type?: 'clock' | 'stats' | 'notifications' | 'calendar' | 'activity';
  size?: 'small' | 'normal' | 'large';
}

export function WidgetPlaceholder({ type = 'stats', size = 'normal' }: WidgetPlaceholderProps) {
  const icons = {
    clock: Clock,
    stats: BarChart3,
    notifications: Bell,
    calendar: Calendar,
    activity: TrendingUp,
  };

  const titles = {
    clock: 'Quick Stats',
    stats: 'Overview',
    notifications: 'Notifications',
    calendar: 'Upcoming',
    activity: 'Recent Activity',
  };

  const Icon = icons[type];

  return (
    <Card className="bg-card/50 border-dashed border-muted-foreground/30">
      <CardHeader className={size === 'small' ? 'p-3' : 'p-4'}>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {titles[type]}
        </CardTitle>
      </CardHeader>
      <CardContent className={size === 'small' ? 'p-3 pt-0' : 'p-4 pt-0'}>
        <div className="flex flex-col gap-2">
          <div className="h-2 w-3/4 bg-muted-foreground/10 rounded animate-pulse" />
          <div className="h-2 w-1/2 bg-muted-foreground/10 rounded animate-pulse" />
          {size !== 'small' && (
            <>
              <div className="h-2 w-2/3 bg-muted-foreground/10 rounded animate-pulse" />
              <div className="h-2 w-1/3 bg-muted-foreground/10 rounded animate-pulse" />
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground/50 mt-3 text-center">
          Widget coming soon
        </p>
      </CardContent>
    </Card>
  );
}

export function WidgetColumn() {
  return (
    <div className="flex flex-col gap-4">
      <WidgetPlaceholder type="stats" size="normal" />
      <WidgetPlaceholder type="activity" size="normal" />
      <WidgetPlaceholder type="notifications" size="small" />
      {/* Add widget button */}
      <div className="flex justify-center pt-2">
        <AddWidgetButton />
      </div>
    </div>
  );
}

export function SidebarWidgets() {
  return (
    <div className="flex flex-col gap-3">
      <WidgetPlaceholder type="clock" size="small" />
      <WidgetPlaceholder type="calendar" size="small" />
      <WidgetPlaceholder type="notifications" size="small" />
      {/* Add widget button */}
      <div className="flex justify-center pt-2">
        <AddWidgetButton />
      </div>
    </div>
  );
}
