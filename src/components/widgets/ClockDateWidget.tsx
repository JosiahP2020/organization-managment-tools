import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { WidgetSize } from "@/types/widgets";

interface ClockDateWidgetProps {
  size?: WidgetSize;
}

export function ClockDateWidget({ size = "small" }: ClockDateWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const isSmall = size === "small";

  return (
    <Card className="bg-card border-border">
      <CardContent className={isSmall ? "p-4" : "p-6"}>
        <div className="flex items-center gap-3">
          <div className={`${isSmall ? "w-10 h-10" : "w-12 h-12"} rounded-xl bg-primary/10 flex items-center justify-center`}>
            <Clock className={`${isSmall ? "w-5 h-5" : "w-6 h-6"} text-primary`} />
          </div>
          <div>
            <p className={`${isSmall ? "text-2xl" : "text-3xl"} font-bold text-foreground tabular-nums`}>
              {formatTime(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(currentTime)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
