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
    // Get the preview iframe or the root element
    const rootElement = document.documentElement;
    
    if (isMobileView) {
      // Apply mobile simulation styles
      rootElement.style.setProperty('--dev-viewport-width', '375px');
      rootElement.style.setProperty('--dev-viewport-height', '667px');
      document.body.classList.add("dev-mobile-view");
      
      // Force mobile media query simulation by adjusting the viewport
      const style = document.createElement('style');
      style.id = 'dev-mobile-styles';
      style.textContent = `
        .dev-mobile-view {
          max-width: 375px !important;
          margin: 0 auto !important;
          min-height: 100vh;
          box-shadow: 0 0 0 1px hsl(var(--border)), 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
        }
        .dev-mobile-view::before {
          content: 'Mobile Preview (375px)';
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 4px 12px;
          font-size: 10px;
          font-weight: 600;
          border-radius: 0 0 8px 8px;
          z-index: 9999;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.classList.remove("dev-mobile-view");
      rootElement.style.removeProperty('--dev-viewport-width');
      rootElement.style.removeProperty('--dev-viewport-height');
      
      // Remove the mobile styles
      const existingStyle = document.getElementById('dev-mobile-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    return () => {
      document.body.classList.remove("dev-mobile-view");
      const existingStyle = document.getElementById('dev-mobile-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isMobileView]);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
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
