import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

/**
 * Hook that returns the appropriate logo URLs based on the current theme.
 * Falls back to light mode logos if dark mode logos are not available.
 */
export function useThemeLogos() {
  const { organization } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure we only read theme after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";

  // Main logo: use dark variant if in dark mode and available
  const mainLogoUrl = 
    isDarkMode && organization?.main_logo_dark_url
      ? organization.main_logo_dark_url
      : organization?.main_logo_url || organization?.logo_url || null;

  // Sub logo: use dark variant if in dark mode and available
  const subLogoUrl = 
    isDarkMode && organization?.sub_logo_dark_url
      ? organization.sub_logo_dark_url
      : organization?.sub_logo_url || null;

  return {
    mainLogoUrl,
    subLogoUrl,
    isDarkMode,
  };
}
