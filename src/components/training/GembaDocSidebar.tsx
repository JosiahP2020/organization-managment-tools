import { Lock, LockOpen, Printer, RectangleVertical, RectangleHorizontal, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card className="w-64 shrink-0 h-fit sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Layout - Admin only when unlocked */}
        {isAdmin && !isLocked && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Grid</Label>
            </div>
            <Select value={currentGridValue} onValueChange={handleGridChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder="Grid" />
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

        {/* Orientation - Admin only when unlocked */}
        {isAdmin && !isLocked && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {orientation === "portrait" ? (
                <RectangleVertical className="h-4 w-4 text-muted-foreground" />
              ) : (
                <RectangleHorizontal className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm">Orientation</Label>
            </div>
            <div className="flex gap-1">
              <Button
                variant={orientation === "portrait" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onOrientationChange("portrait")}
                title="Portrait"
              >
                <RectangleVertical className="h-4 w-4" />
              </Button>
              <Button
                variant={orientation === "landscape" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onOrientationChange("landscape")}
                title="Landscape"
              >
                <RectangleHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Lock Toggle - Admin only */}
        {isAdmin && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <LockOpen className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="lock-doc" className="text-sm cursor-pointer">
                {isLocked ? "Unlock Document" : "Lock Document"}
              </Label>
            </div>
            <Switch
              id="lock-doc"
              checked={isLocked}
              onCheckedChange={onLockChange}
            />
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          {/* Print Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        {doubleSided && (
          <p className="text-xs text-muted-foreground">
            Configure double-sided in your print dialog
          </p>
        )}
      </CardContent>
    </Card>
  );
}
