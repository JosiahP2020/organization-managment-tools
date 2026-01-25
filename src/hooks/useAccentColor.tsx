import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_ACCENT = "22 90% 54%"; // Orange

export function useAccentColor() {
  const { organization } = useAuth();
  
  useEffect(() => {
    const accentColor = organization?.accent_color || DEFAULT_ACCENT;
    const root = document.documentElement;
    const [h] = accentColor.split(" ");
    
    const applyColors = () => {
      const isDarkMode = root.classList.contains("dark");
      
      // Primary color (main accent) - always use brand color
      root.style.setProperty("--primary", accentColor);
      root.style.setProperty("--ring", accentColor);
      root.style.setProperty("--brand-orange", accentColor);
      root.style.setProperty("--sidebar-ring", accentColor);
      root.style.setProperty("--brand-orange-hover", `${h} 90% 48%`);
      
      // Accent colors - use neutral gray in dark mode to avoid washing out text
      if (isDarkMode) {
        root.style.setProperty("--accent", "0 0% 32%");
        root.style.setProperty("--accent-foreground", "0 0% 96%");
      } else {
        root.style.setProperty("--accent", `${h} 90% 96%`);
        root.style.setProperty("--accent-foreground", `${h} 90% 40%`);
      }
    };
    
    // Apply immediately
    applyColors();
    
    // Watch for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          applyColors();
        }
      });
    });
    
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    
    // Cleanup on unmount
    return () => {
      observer.disconnect();
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--brand-orange");
      root.style.removeProperty("--sidebar-ring");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-foreground");
      root.style.removeProperty("--brand-orange-hover");
    };
  }, [organization?.accent_color]);
}