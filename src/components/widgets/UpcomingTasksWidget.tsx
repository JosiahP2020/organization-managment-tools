import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Circle, CheckCircle2 } from "lucide-react";
import type { WidgetSize } from "@/types/widgets";

interface UpcomingTasksWidgetProps {
  size?: WidgetSize;
}

// Placeholder tasks - will be replaced with real data
const placeholderTasks = [
  { id: "1", title: "Complete safety training", due: "Today", priority: "high", completed: false },
  { id: "2", title: "Review equipment checklist", due: "Tomorrow", priority: "medium", completed: false },
  { id: "3", title: "Submit weekly report", due: "Fri", priority: "low", completed: true },
  { id: "4", title: "Team meeting prep", due: "Mon", priority: "medium", completed: false },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "low":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
};

export function UpcomingTasksWidget({ size = "medium" }: UpcomingTasksWidgetProps) {
  const isSmall = size === "small";
  const displayTasks = isSmall ? placeholderTasks.slice(0, 3) : placeholderTasks;

  const incompleteTasks = displayTasks.filter(t => !t.completed);
  const completedCount = placeholderTasks.filter(t => t.completed).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className={isSmall ? "p-3 pb-2" : "p-4 pb-3"}>
        <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Upcoming Tasks
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {completedCount}/{placeholderTasks.length} done
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className={isSmall ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className="space-y-2">
          {incompleteTasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <button className="flex-shrink-0">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className={`w-5 h-5 ${getPriorityColor(task.priority)} group-hover:text-primary transition-colors`} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {task.due}
              </span>
            </div>
          ))}
        </div>
        {!isSmall && (
          <button className="w-full mt-3 text-xs text-primary hover:underline">
            View all tasks
          </button>
        )}
      </CardContent>
    </Card>
  );
}
