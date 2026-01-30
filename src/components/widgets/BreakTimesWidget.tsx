import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Timer } from "lucide-react";
import type { WidgetSize } from "@/types/widgets";

interface BreakTimesWidgetProps {
  size?: WidgetSize;
}

// Placeholder break schedule - will be configurable
const breakSchedule = [
  { id: "1", name: "Morning Break", time: "10:00 AM", duration: "15 min" },
  { id: "2", name: "Lunch", time: "12:00 PM", duration: "1 hour" },
  { id: "3", name: "Afternoon Break", time: "3:00 PM", duration: "15 min" },
];

export function BreakTimesWidget({ size = "small" }: BreakTimesWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getNextBreak = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (const breakItem of breakSchedule) {
      const [time, period] = breakItem.time.split(" ");
      const [hourStr, minuteStr] = time.split(":");
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      
      if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
        const minutesUntil = (hour - currentHour) * 60 + (minute - currentMinute);
        return { ...breakItem, minutesUntil };
      }
    }
    
    return null;
  };

  const nextBreak = getNextBreak();
  const isSmall = size === "small";

  return (
    <Card className="bg-card border-border">
      <CardHeader className={isSmall ? "p-3 pb-2" : "p-4 pb-3"}>
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Coffee className="h-4 w-4 text-primary" />
          Break Times
        </CardTitle>
      </CardHeader>
      <CardContent className={isSmall ? "p-3 pt-0" : "p-4 pt-0"}>
        {nextBreak ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {nextBreak.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextBreak.time} • {nextBreak.minutesUntil} min away
                </p>
              </div>
            </div>
            {!isSmall && (
              <div className="space-y-2">
                {breakSchedule.map((breakItem) => (
                  <div key={breakItem.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{breakItem.name}</span>
                    <span className="text-foreground">{breakItem.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Coffee className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No more breaks today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
