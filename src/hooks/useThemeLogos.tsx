import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
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
  const mainLogoColors = (organization?.main_logo_colors as ThemeColorMappings) || null;
  const subLogoColors = (organization?.sub_logo_colors as ThemeColorMappings) || null;

  // Transform SVG logo with color mappings
  const transformLogo = useCallback(async (
    url: string | null,
    colorMappings: ThemeColorMappings | null,
    mode: "light" | "dark"
  ): Promise<string | null> => {
    if (!url) {
      return null;
    }

    // Only transform SVG files that have color mappings
    if (!isSvgUrl(url)) {
      return url;
    }

    const mappings = colorMappings?.[mode] || {};
    if (Object.keys(mappings).length === 0) {
      // No color mappings, use original URL
      return url;
    }

    try {
      const svgContent = await fetchSvgContent(url);
      const modifiedSvg = applySvgColorMappings(svgContent, mappings);
      const dataUri = svgToDataUri(modifiedSvg);
      return dataUri;
    } catch (error) {
      console.error("Failed to transform SVG:", error);
      // Fall back to original URL on error
      return url;
    }
  }, []);

  // Apply color transformations to SVG logos
  useEffect(() => {
    if (!mounted) return;

    let isCancelled = false;

    async function applyTransformations() {
      const [mainResult, subResult] = await Promise.all([
        transformLogo(rawMainLogoUrl, mainLogoColors, currentMode),
        transformLogo(rawSubLogoUrl, subLogoColors, currentMode)
      ]);

      if (!isCancelled) {
        setTransformedMainLogo(mainResult);
        setTransformedSubLogo(subResult);
      }
    }

    applyTransformations();

    return () => {
      isCancelled = true;
    };
  }, [rawMainLogoUrl, rawSubLogoUrl, mainLogoColors, subLogoColors, currentMode, mounted, transformLogo]);

  // CSS class to apply brightness filter in dark mode (dims white to light gray)
  // Only apply if no custom dark mode colors are set
  const hasCustomDarkMainColors = Object.keys(mainLogoColors?.dark || {}).length > 0;
  const hasCustomDarkSubColors = Object.keys(subLogoColors?.dark || {}).length > 0;
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
