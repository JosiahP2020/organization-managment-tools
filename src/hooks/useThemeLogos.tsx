import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

/**
 * Hook that returns the appropriate logo URLs based on the current theme.
 * In dark mode, applies a CSS filter class to soften white colors to gray.
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

  // Use base logos - no separate dark mode logos needed
  const mainLogoUrl = organization?.main_logo_url || organization?.logo_url || null;
  const subLogoUrl = organization?.sub_logo_url || null;

  // CSS class to apply brightness filter in dark mode (dims white to light gray)
  const logoFilterClass = isDarkMode ? "dark-mode-logo" : "";

  return {
    mainLogoUrl,
    subLogoUrl,
    isDarkMode,
    logoFilterClass,
  };
}
