import type { WidgetType, WidgetSize } from "@/types/widgets";
import { QuickStatsWidget } from "./QuickStatsWidget";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { ClockDateWidget } from "./ClockDateWidget";
import { UpcomingTasksWidget } from "./UpcomingTasksWidget";
import { BreakTimesWidget } from "./BreakTimesWidget";
import { NotificationsWidget } from "./NotificationsWidget";

interface WidgetRendererProps {
  type: WidgetType;
  size?: WidgetSize;
}

export function WidgetRenderer({ type, size = "medium" }: WidgetRendererProps) {
  switch (type) {
    case "quick-stats":
      return <QuickStatsWidget size={size} />;
    case "recent-activity":
      return <RecentActivityWidget size={size} />;
    case "clock-date":
      return <ClockDateWidget size={size} />;
    case "upcoming-tasks":
      return <UpcomingTasksWidget size={size} />;
    case "break-times":
      return <BreakTimesWidget size={size} />;
    case "notifications":
      return <NotificationsWidget size={size} />;
    default:
      return null;
  }
}
