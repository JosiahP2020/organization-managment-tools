import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { 
  fetchSvgContent, 
  applySvgColorMappings, 
  svgToDataUri, 
  isSvgUrl 
} from "@/lib/svgColorUtils";
import type { ThemeColorMappings } from "@/components/SvgColorEditor";

/**
 * Hook that returns the appropriate logo URLs based on the current theme.
 * For SVG logos with color customizations, applies the color mappings and returns data URIs.
 */
export function useThemeLogos() {
  const { organization } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State for transformed logo URLs
  const [transformedMainLogo, setTransformedMainLogo] = useState<string | null>(null);
  const [transformedSubLogo, setTransformedSubLogo] = useState<string | null>(null);

  // Ensure we only read theme after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";
  const currentMode = isDarkMode ? "dark" : "light";

  // Raw logo URLs from organization
  const rawMainLogoUrl = organization?.main_logo_url || organization?.logo_url || null;
  const rawSubLogoUrl = organization?.sub_logo_url || null;
  
  // Color mappings from organization (stored as JSON)
  const mainLogoColors = (organization?.main_logo_colors as ThemeColorMappings) || { light: {}, dark: {} };
  const subLogoColors = (organization?.sub_logo_colors as ThemeColorMappings) || { light: {}, dark: {} };

  // Apply color transformations to SVG logos
  useEffect(() => {
    async function transformLogo(
      url: string | null,
      colorMappings: ThemeColorMappings,
      mode: "light" | "dark",
      setTransformed: (url: string | null) => void
    ) {
      if (!url) {
        setTransformed(null);
        return;
      }

      // Only transform SVG files that have color mappings
      if (!isSvgUrl(url)) {
        setTransformed(url);
        return;
      }

      const mappings = colorMappings[mode] || {};
      if (Object.keys(mappings).length === 0) {
        // No color mappings, use original URL
        setTransformed(url);
        return;
      }

      try {
        const svgContent = await fetchSvgContent(url);
        const modifiedSvg = applySvgColorMappings(svgContent, mappings);
        const dataUri = svgToDataUri(modifiedSvg);
        setTransformed(dataUri);
      } catch (error) {
        console.error("Failed to transform SVG:", error);
        // Fall back to original URL on error
        setTransformed(url);
      }
    }

    if (mounted) {
      transformLogo(rawMainLogoUrl, mainLogoColors, currentMode, setTransformedMainLogo);
      transformLogo(rawSubLogoUrl, subLogoColors, currentMode, setTransformedSubLogo);
    }
  }, [rawMainLogoUrl, rawSubLogoUrl, mainLogoColors, subLogoColors, currentMode, mounted]);

  // CSS class to apply brightness filter in dark mode (dims white to light gray)
  // Only apply if no custom dark mode colors are set
  const hasCustomDarkMainColors = Object.keys(mainLogoColors.dark || {}).length > 0;
  const hasCustomDarkSubColors = Object.keys(subLogoColors.dark || {}).length > 0;
  const logoFilterClass = isDarkMode && !hasCustomDarkMainColors ? "dark-mode-logo" : "";

  return {
    mainLogoUrl: transformedMainLogo ?? rawMainLogoUrl,
    subLogoUrl: transformedSubLogo ?? rawSubLogoUrl,
    isDarkMode,
    logoFilterClass,
    // Also expose raw URLs in case needed
    rawMainLogoUrl,
    rawSubLogoUrl,
  };
}
