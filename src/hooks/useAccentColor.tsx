import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_ACCENT = "22 90% 54%"; // Orange

export function useAccentColor() {
  const { organization } = useAuth();
  
  useEffect(() => {
    const accentColor = organization?.accent_color || DEFAULT_ACCENT;
    
    // Apply accent color to CSS variables
    const root = document.documentElement;
    
    // Primary color (main accent)
    root.style.setProperty("--primary", accentColor);
    root.style.setProperty("--ring", accentColor);
    root.style.setProperty("--brand-orange", accentColor);
    root.style.setProperty("--sidebar-ring", accentColor);
    
    // Accent background (light tint of the color)
    // Parse the HSL and create a lighter version for accent background
    const [h] = accentColor.split(" ");
    root.style.setProperty("--accent", `${h} 90% 96%`);
    root.style.setProperty("--accent-foreground", `${h} 90% 40%`);
    
    // Darker hover variant
    root.style.setProperty("--brand-orange-hover", `${h} 90% 48%`);
    
    // Cleanup on unmount
    return () => {
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