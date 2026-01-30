import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Users, FolderOpen } from "lucide-react";
import type { WidgetSize } from "@/types/widgets";

interface QuickStatsWidgetProps {
  size?: WidgetSize;
}

// Placeholder stats - will be replaced with real data
const placeholderStats = [
  { label: "Documents", value: 24, icon: FileText, trend: "+3" },
  { label: "Projects", value: 8, icon: FolderOpen, trend: "+1" },
  { label: "Team", value: 12, icon: Users, trend: "0" },
];

export function QuickStatsWidget({ size = "medium" }: QuickStatsWidgetProps) {
  const isSmall = size === "small";

  return (
    <Card className="bg-card border-border">
      <CardHeader className={isSmall ? "p-3 pb-2" : "p-4 pb-3"}>
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className={isSmall ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className={`grid ${isSmall ? "grid-cols-3 gap-2" : "gap-3"}`}>
          {placeholderStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className={`flex items-center gap-3 ${!isSmall && "p-2 rounded-lg bg-muted/50"}`}
              >
                <div className={`${isSmall ? "w-8 h-8" : "w-10 h-10"} rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <Icon className={`${isSmall ? "w-4 h-4" : "w-5 h-5"} text-primary`} />
                </div>
                <div>
                  <p className={`${isSmall ? "text-lg" : "text-2xl"} font-bold text-foreground`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                {!isSmall && stat.trend !== "0" && (
                  <span className={`text-xs ml-auto ${stat.trend.startsWith("+") ? "text-green-500" : "text-muted-foreground"}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
