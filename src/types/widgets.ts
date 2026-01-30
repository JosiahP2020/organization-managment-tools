export type WidgetType = 
  | 'quick-stats' 
  | 'recent-activity' 
  | 'clock-date' 
  | 'upcoming-tasks' 
  | 'break-times' 
  | 'notifications';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  title?: string;
  refreshInterval?: number;
  showHeader?: boolean;
}

export interface DashboardWidget {
  id: string;
  widget_type: WidgetType;
  name: string;
  size: WidgetSize;
  position: number;
  is_visible: boolean;
  config: WidgetConfig;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetTypeInfo {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
}

export const WIDGET_TYPES: WidgetTypeInfo[] = [
  {
    type: 'quick-stats',
    name: 'Quick Stats',
    description: 'Display key metrics like total documents, projects, or users',
    icon: 'bar-chart-3',
    defaultSize: 'medium',
  },
  {
    type: 'recent-activity',
    name: 'Recent Activity',
    description: 'Show recent actions taken in the organization',
    icon: 'activity',
    defaultSize: 'medium',
  },
  {
    type: 'clock-date',
    name: 'Clock & Date',
    description: 'Display current time and date',
    icon: 'clock',
    defaultSize: 'small',
  },
  {
    type: 'upcoming-tasks',
    name: 'Upcoming Tasks',
    description: 'Show pending items or deadlines',
    icon: 'calendar-check',
    defaultSize: 'medium',
  },
  {
    type: 'break-times',
    name: 'Break Times',
    description: 'Display scheduled break times and reminders',
    icon: 'coffee',
    defaultSize: 'small',
  },
  {
    type: 'notifications',
    name: 'Notifications',
    description: 'View important alerts and reminders',
    icon: 'bell',
    defaultSize: 'small',
  },
];
