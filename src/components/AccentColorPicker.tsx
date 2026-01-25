import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw } from "lucide-react";

interface AccentColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

// Preset colors with their HSL values (without the hsl() wrapper)
const PRESET_COLORS = [
  { name: "Orange", hsl: "22 90% 54%", hex: "#f97316" },
  { name: "Blue", hsl: "217 91% 60%", hex: "#3b82f6" },
  { name: "Green", hsl: "142 71% 45%", hex: "#22c55e" },
  { name: "Purple", hsl: "262 83% 58%", hex: "#8b5cf6" },
  { name: "Red", hsl: "0 84% 60%", hex: "#ef4444" },
  { name: "Teal", hsl: "172 66% 50%", hex: "#14b8a6" },
  { name: "Pink", hsl: "330 81% 60%", hex: "#ec4899" },
  { name: "Amber", hsl: "38 92% 50%", hex: "#f59e0b" },
];

const DEFAULT_ACCENT = "22 90% 54%"; // Orange

// Convert hex to HSL string (returns "h s% l%" format)
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  const currentHsl = value || DEFAULT_ACCENT;
  
  // Find matching preset or use custom
  const currentPreset = PRESET_COLORS.find(p => p.hsl === currentHsl);
  
  const handleHexChange = (hex: string) => {
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(hexToHsl(hex));
    }
  };

  const handleReset = () => {
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <Label>Accent Color</Label>
      
      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color.hsl)}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
              currentHsl === color.hsl 
                ? "border-foreground ring-2 ring-offset-2 ring-foreground/20" 
                : "border-transparent"
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>
      
      {/* Custom color input */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Custom:</span>
        </div>
        <Input
          type="color"
          defaultValue={currentPreset?.hex || "#f97316"}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-14 h-10 p-1 cursor-pointer"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset to Default
        </Button>
      </div>
      
      {/* Preview */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <div 
          className="w-8 h-8 rounded-md"
          style={{ backgroundColor: `hsl(${currentHsl})` }}
        />
        <div className="text-sm">
          <span className="text-muted-foreground">Preview: </span>
          <span className="font-medium">{currentPreset?.name || "Custom Color"}</span>
        </div>
      </div>
    </div>
  );
}