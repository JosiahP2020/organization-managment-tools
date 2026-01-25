/**
 * Utility functions for extracting and manipulating colors in SVG files
 */

// Regex patterns to find colors in SVG
const HEX_COLOR_REGEX = /#([0-9A-Fa-f]{3}){1,2}\b/g;
const RGB_COLOR_REGEX = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi;
const RGBA_COLOR_REGEX = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi;

// Common SVG color keywords to hex mapping
const COLOR_KEYWORDS: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  gray: '#808080',
  grey: '#808080',
  silver: '#C0C0C0',
  maroon: '#800000',
  olive: '#808000',
  lime: '#00FF00',
  aqua: '#00FFFF',
  teal: '#008080',
  navy: '#000080',
  fuchsia: '#FF00FF',
  purple: '#800080',
  orange: '#FFA500',
};

/**
 * Normalize a hex color to uppercase 6-character format
 */
export function normalizeHexColor(hex: string): string {
  let normalized = hex.toUpperCase();
  // Convert 3-char hex to 6-char
  if (normalized.length === 4) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return normalized;
}

/**
 * Convert RGB string to hex
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  const [r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Fetch SVG content from a URL
 */
export async function fetchSvgContent(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.statusText}`);
  }
  const text = await response.text();
  return text;
}

/**
 * Extract all unique colors from SVG content
 */
export function extractColorsFromSvg(svgContent: string): string[] {
  const colors = new Set<string>();
  
  // Find hex colors
  const hexMatches = svgContent.match(HEX_COLOR_REGEX) || [];
  hexMatches.forEach(hex => colors.add(normalizeHexColor(hex)));
  
  // Find rgb colors and convert to hex
  const rgbMatches = svgContent.match(RGB_COLOR_REGEX) || [];
  rgbMatches.forEach(rgb => colors.add(rgbToHex(rgb)));
  
  // Find rgba colors and convert to hex (ignoring alpha)
  const rgbaMatches = svgContent.match(RGBA_COLOR_REGEX) || [];
  rgbaMatches.forEach(rgba => colors.add(rgbToHex(rgba)));
  
  // Find color keywords in fill and stroke attributes
  const keywordRegex = /(?:fill|stroke)\s*[:=]\s*["']?(\w+)["']?/gi;
  let match;
  while ((match = keywordRegex.exec(svgContent)) !== null) {
    const colorName = match[1].toLowerCase();
    if (COLOR_KEYWORDS[colorName]) {
      colors.add(COLOR_KEYWORDS[colorName]);
    }
  }
  
  // Remove 'none' and 'currentColor' if somehow captured
  colors.delete('NONE');
  colors.delete('CURRENTCOLOR');
  
  return Array.from(colors).sort();
}

/**
 * Apply color mappings to SVG content
 */
export function applySvgColorMappings(
  svgContent: string, 
  colorMappings: Record<string, string>
): string {
  let modifiedSvg = svgContent;
  
  // Apply each color mapping
  Object.entries(colorMappings).forEach(([originalColor, newColor]) => {
    if (!newColor || originalColor === newColor) return;
    
    const normalizedOriginal = normalizeHexColor(originalColor);
    const normalizedNew = normalizeHexColor(newColor);
    
    // Replace the color in various formats
    // Case-insensitive replacement for hex colors
    const hexRegex = new RegExp(
      normalizedOriginal.replace('#', '#?'), 
      'gi'
    );
    modifiedSvg = modifiedSvg.replace(hexRegex, normalizedNew);
    
    // Also try lowercase version
    const lowerOriginal = originalColor.toLowerCase();
    if (lowerOriginal !== normalizedOriginal.toLowerCase()) {
      const lowerRegex = new RegExp(lowerOriginal.replace('#', '#?'), 'gi');
      modifiedSvg = modifiedSvg.replace(lowerRegex, normalizedNew);
    }
  });
  
  return modifiedSvg;
}

/**
 * Check if a URL points to an SVG file
 */
export function isSvgUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.endsWith('.svg');
  } catch {
    return url.toLowerCase().endsWith('.svg');
  }
}

/**
 * Convert SVG content to a data URI for use as image src
 */
export function svgToDataUri(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}
