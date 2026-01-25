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
    const appRoot = document.getElementById('root');
    
    if (isMobileView && appRoot) {
      // Create wrapper for mobile simulation
      appRoot.style.maxWidth = '375px';
      appRoot.style.margin = '0 auto';
      appRoot.style.boxShadow = '0 0 0 1px hsl(var(--border)), 0 25px 50px -12px rgba(0, 0, 0, 0.25)';
      appRoot.style.position = 'relative';
      appRoot.style.overflow = 'hidden';
      
      // Add indicator
      const indicator = document.createElement('div');
      indicator.id = 'dev-mobile-indicator';
      indicator.style.cssText = `
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
        z-index: 99999;
      `;
      indicator.textContent = 'Mobile Preview (375px)';
      document.body.appendChild(indicator);
      
      // Set body background to show it's a mobile preview
      document.body.style.background = 'hsl(var(--muted))';
    } else if (appRoot) {
      appRoot.style.maxWidth = '';
      appRoot.style.margin = '';
      appRoot.style.boxShadow = '';
      appRoot.style.position = '';
      appRoot.style.overflow = '';
      document.body.style.background = '';
      
      const indicator = document.getElementById('dev-mobile-indicator');
      if (indicator) indicator.remove();
    }

    return () => {
      if (appRoot) {
        appRoot.style.maxWidth = '';
        appRoot.style.margin = '';
        appRoot.style.boxShadow = '';
        appRoot.style.position = '';
        appRoot.style.overflow = '';
      }
      document.body.style.background = '';
      const indicator = document.getElementById('dev-mobile-indicator');
      if (indicator) indicator.remove();
    };
  }, [isMobileView]);

  return (
    <div className="fixed bottom-4 left-4 z-[99998] flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
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
