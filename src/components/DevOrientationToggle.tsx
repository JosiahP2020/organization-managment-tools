import { useState, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Development-only toggle for switching between desktop and mobile view.
 * This component is intended for development purposes only.
 */
export function DevOrientationToggle() {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Apply the mobile view class to the body
    if (isMobileView) {
      document.body.classList.add("dev-mobile-view");
    } else {
      document.body.classList.remove("dev-mobile-view");
    }

    return () => {
      document.body.classList.remove("dev-mobile-view");
    };
  }, [isMobileView]);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
      <span className="text-xs text-muted-foreground font-medium px-2">DEV:</span>
      <Button
        variant={!isMobileView ? "default" : "outline"}
        size="sm"
        onClick={() => setIsMobileView(false)}
        className="gap-1.5 h-8"
      >
        <Monitor className="w-3.5 h-3.5" />
        Desktop
      </Button>
      <Button
        variant={isMobileView ? "default" : "outline"}
        size="sm"
        onClick={() => setIsMobileView(true)}
        className="gap-1.5 h-8"
      >
        <Smartphone className="w-3.5 h-3.5" />
        Mobile
      </Button>
    </div>
  );
}
