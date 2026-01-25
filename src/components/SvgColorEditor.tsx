import { useState, useEffect } from "react";
import { Palette, RotateCcw, Loader2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  fetchSvgContent,
  extractColorsFromSvg,
  applySvgColorMappings,
  svgToDataUri,
} from "@/lib/svgColorUtils";

// Structure for light/dark mode color mappings
export interface ThemeColorMappings {
  light: Record<string, string>;
  dark: Record<string, string>;
}

interface SvgColorEditorProps {
  svgUrl: string;
  colorMappings: ThemeColorMappings;
  onColorMappingsChange: (mappings: ThemeColorMappings) => void;
  label?: string;
}

export function SvgColorEditor({
  svgUrl,
  colorMappings,
  onColorMappingsChange,
  label = "Customize Logo Colors",
}: SvgColorEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

  // Fetch and parse SVG when opened
  useEffect(() => {
    if (isOpen && !svgContent) {
      loadSvg();
    }
  }, [isOpen, svgUrl]);

  const loadSvg = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await fetchSvgContent(svgUrl);
      setSvgContent(content);
      const colors = extractColorsFromSvg(content);
      setExtractedColors(colors);
    } catch (err) {
      setError("Failed to load SVG for color editing");
      console.error("SVG load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMappings = colorMappings[activeMode] || {};

  const handleColorChange = (originalColor: string, newColor: string) => {
    const updatedMappings = { ...currentMappings };
    if (newColor && newColor !== originalColor) {
      updatedMappings[originalColor] = newColor;
    } else {
      delete updatedMappings[originalColor];
    }
    onColorMappingsChange({
      ...colorMappings,
      [activeMode]: updatedMappings,
    });
  };

  const resetColor = (originalColor: string) => {
    const updatedMappings = { ...currentMappings };
    delete updatedMappings[originalColor];
    onColorMappingsChange({
      ...colorMappings,
      [activeMode]: updatedMappings,
    });
  };

  const resetAllColors = () => {
    onColorMappingsChange({
      ...colorMappings,
      [activeMode]: {},
    });
  };

  // Generate preview with applied color mappings for a specific mode
  const getPreviewSrc = (mode: "light" | "dark") => {
    if (!svgContent) return svgUrl;
    const mappings = colorMappings[mode] || {};
    if (Object.keys(mappings).length === 0) return svgUrl;
    const modifiedSvg = applySvgColorMappings(svgContent, mappings);
    return svgToDataUri(modifiedSvg);
  };

  // Count total modifications across both modes
  const totalModifications = 
    Object.keys(colorMappings.light || {}).length + 
    Object.keys(colorMappings.dark || {}).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
        >
          <Palette className="w-3.5 h-3.5" />
          {label}
          {totalModifications > 0 && (
            <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
              {totalModifications} modified
            </span>
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading SVG...
            </span>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            {error}
          </div>
        )}

        {!isLoading && !error && svgContent && (
          <>
            {/* Preview Section - shows both modes side by side */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div className="flex gap-3">
                {/* Light mode preview */}
                <div className="flex-1 space-y-1">
                  <div className="p-4 rounded-lg bg-white border flex items-center justify-center min-h-[80px]">
                    <img
                      src={getPreviewSrc("light")}
                      alt="Logo preview (light)"
                      className="max-h-16 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Sun className="w-3 h-3" />
                    Light
                    {Object.keys(colorMappings.light || {}).length > 0 && (
                      <span className="text-primary">
                        ({Object.keys(colorMappings.light).length})
                      </span>
                    )}
                  </div>
                </div>
                {/* Dark mode preview */}
                <div className="flex-1 space-y-1">
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center min-h-[80px]">
                    <img
                      src={getPreviewSrc("dark")}
                      alt="Logo preview (dark)"
                      className="max-h-16 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Moon className="w-3 h-3" />
                    Dark
                    {Object.keys(colorMappings.dark || {}).length > 0 && (
                      <span className="text-primary">
                        ({Object.keys(colorMappings.dark).length})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Tabs for editing */}
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as "light" | "dark")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="light" className="gap-1.5 text-xs">
                  <Sun className="w-3.5 h-3.5" />
                  Light Mode
                </TabsTrigger>
                <TabsTrigger value="dark" className="gap-1.5 text-xs">
                  <Moon className="w-3.5 h-3.5" />
                  Dark Mode
                </TabsTrigger>
              </TabsList>

              <TabsContent value="light" className="mt-3">
                <ColorMappingEditor
                  extractedColors={extractedColors}
                  colorMappings={colorMappings.light || {}}
                  onColorChange={handleColorChange}
                  onResetColor={resetColor}
                  onResetAll={resetAllColors}
                />
              </TabsContent>

              <TabsContent value="dark" className="mt-3">
                <ColorMappingEditor
                  extractedColors={extractedColors}
                  colorMappings={colorMappings.dark || {}}
                  onColorChange={handleColorChange}
                  onResetColor={resetColor}
                  onResetAll={resetAllColors}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Extracted component for the color mapping UI
interface ColorMappingEditorProps {
  extractedColors: string[];
  colorMappings: Record<string, string>;
  onColorChange: (originalColor: string, newColor: string) => void;
  onResetColor: (originalColor: string) => void;
  onResetAll: () => void;
}

function ColorMappingEditor({
  extractedColors,
  colorMappings,
  onColorChange,
  onResetColor,
  onResetAll,
}: ColorMappingEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">
          Colors ({extractedColors.length} found)
        </Label>
        {Object.keys(colorMappings).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetAll}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset All
          </Button>
        )}
      </div>

      {extractedColors.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No editable colors found in this SVG.
        </p>
      ) : (
        <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
          {extractedColors.map((color) => (
            <div
              key={color}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              {/* Original color swatch */}
              <div
                className="w-6 h-6 rounded border border-border flex-shrink-0"
                style={{ backgroundColor: color }}
                title={`Original: ${color}`}
              />

              {/* Arrow */}
              <span className="text-muted-foreground text-xs">→</span>

              {/* Color picker input */}
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="color"
                  value={colorMappings[color] || color}
                  onChange={(e) => onColorChange(color, e.target.value)}
                  className="w-10 h-8 p-0.5 cursor-pointer"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {(colorMappings[color] || color).toUpperCase()}
                </span>
              </div>

              {/* Reset button */}
              {colorMappings[color] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResetColor(color)}
                  className="h-6 w-6 p-0"
                  title="Reset to original"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
