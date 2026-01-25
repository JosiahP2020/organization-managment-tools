import { Lock, Unlock, Printer, RectangleVertical, RectangleHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const GRID_PRESETS = [
  { label: "1×1", rows: 1, cols: 1, value: "1x1" },
  { label: "1×2", rows: 1, cols: 2, value: "1x2" },
  { label: "2×1", rows: 2, cols: 1, value: "2x1" },
  { label: "2×2", rows: 2, cols: 2, value: "2x2" },
  { label: "2×3", rows: 2, cols: 3, value: "2x3" },
  { label: "3×2", rows: 3, cols: 2, value: "3x2" },
  { label: "3×3", rows: 3, cols: 3, value: "3x3" },
  { label: "4×4", rows: 4, cols: 4, value: "4x4" },
  { label: "6×6", rows: 6, cols: 6, value: "6x6" },
];

interface GembaDocSidebarProps {
  isLocked: boolean;
  onLockChange: (locked: boolean) => void;
  orientation: "portrait" | "landscape";
  onOrientationChange: (orientation: "portrait" | "landscape") => void;
  gridRows: number;
  gridCols: number;
  onGridChange: (rows: number, cols: number) => void;
  doubleSided: boolean;
  onDoubleSidedChange: (doubleSided: boolean) => void;
  onPrint: () => void;
  isAdmin: boolean;
}

export function GembaDocSidebar({
  isLocked,
  onLockChange,
  orientation,
  onOrientationChange,
  gridRows,
  gridCols,
  onGridChange,
  doubleSided,
  onDoubleSidedChange,
  onPrint,
  isAdmin,
}: GembaDocSidebarProps) {
  const currentGridValue = `${gridRows}x${gridCols}`;

  const handleGridChange = (value: string) => {
    const preset = GRID_PRESETS.find((p) => p.value === value);
    if (preset) {
      onGridChange(preset.rows, preset.cols);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-card border-r border-border">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Settings
      </h3>

      {/* Grid Layout */}
      {isAdmin && !isLocked && (
        <div className="space-y-2">
          <Label className="text-sm">Grid Layout</Label>
          <Select value={currentGridValue} onValueChange={handleGridChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select grid" />
            </SelectTrigger>
            <SelectContent>
              {GRID_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Orientation */}
      {isAdmin && !isLocked && (
        <div className="space-y-2">
          <Label className="text-sm">Orientation</Label>
          <div className="flex gap-2">
            <Button
              variant={orientation === "portrait" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onOrientationChange("portrait")}
            >
              <RectangleVertical className="h-4 w-4" />
              Portrait
            </Button>
            <Button
              variant={orientation === "landscape" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onOrientationChange("landscape")}
            >
              <RectangleHorizontal className="h-4 w-4" />
              Landscape
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Double-Sided Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="double-sided" className="text-sm cursor-pointer">
          Double-Sided
        </Label>
        <Switch
          id="double-sided"
          checked={doubleSided}
          onCheckedChange={onDoubleSidedChange}
        />
      </div>
      {doubleSided && (
        <p className="text-xs text-muted-foreground -mt-2">
          Configure double-sided in your print dialog
        </p>
      )}

      {/* Lock Toggle */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <Label htmlFor="lock-doc" className="text-sm cursor-pointer">
            Lock Document
          </Label>
          <Switch
            id="lock-doc"
            checked={isLocked}
            onCheckedChange={onLockChange}
          />
        </div>
      )}

      <div className="flex-1" />

      {/* Print Button */}
      <Button onClick={onPrint} variant="outline" className="w-full gap-2">
        <Printer className="h-4 w-4" />
        Print
      </Button>

      {/* Lock Status */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm",
          isLocked
            ? "bg-destructive/10 text-destructive"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4" />
            Locked
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            Editing
          </>
        )}
      </div>
    </div>
  );
}
