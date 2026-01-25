import { useState, useEffect } from "react";
import { Palette, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface SvgColorEditorProps {
  svgUrl: string;
  colorMappings: Record<string, string>;
  onColorMappingsChange: (mappings: Record<string, string>) => void;
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

  const handleColorChange = (originalColor: string, newColor: string) => {
    const updatedMappings = { ...colorMappings };
    if (newColor && newColor !== originalColor) {
      updatedMappings[originalColor] = newColor;
    } else {
      delete updatedMappings[originalColor];
    }
    onColorMappingsChange(updatedMappings);
  };

  const resetColor = (originalColor: string) => {
    const updatedMappings = { ...colorMappings };
    delete updatedMappings[originalColor];
    onColorMappingsChange(updatedMappings);
  };

  const resetAllColors = () => {
    onColorMappingsChange({});
  };

  // Generate preview with applied color mappings
  const getPreviewSrc = () => {
    if (!svgContent) return svgUrl;
    if (Object.keys(colorMappings).length === 0) return svgUrl;
    const modifiedSvg = applySvgColorMappings(svgContent, colorMappings);
    return svgToDataUri(modifiedSvg);
  };

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
          {Object.keys(colorMappings).length > 0 && (
            <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
              {Object.keys(colorMappings).length} modified
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
            {/* Preview Section */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div className="flex gap-3">
                {/* Light mode preview */}
                <div className="flex-1 p-4 rounded-lg bg-white border flex items-center justify-center">
                  <img
                    src={getPreviewSrc()}
                    alt="Logo preview (light)"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                {/* Dark mode preview */}
                <div className="flex-1 p-4 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <img
                    src={getPreviewSrc()}
                    alt="Logo preview (dark)"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Light & Dark mode preview
              </p>
            </div>

            {/* Color Mappings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Colors ({extractedColors.length} found)
                </Label>
                {Object.keys(colorMappings).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAllColors}
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
                <div className="grid gap-2">
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
                          onChange={(e) =>
                            handleColorChange(color, e.target.value)
                          }
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
                          onClick={() => resetColor(color)}
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
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
