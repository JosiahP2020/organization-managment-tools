import { useState, useEffect } from "react";
import { Lock, LockOpen, Printer, RectangleVertical, RectangleHorizontal, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  const [rowsInput, setRowsInput] = useState(String(gridRows));
  const [colsInput, setColsInput] = useState(String(gridCols));

  useEffect(() => {
    setRowsInput(String(gridRows));
  }, [gridRows]);

  useEffect(() => {
    setColsInput(String(gridCols));
  }, [gridCols]);

  const handleRowsChange = (value: string) => {
    setRowsInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      onGridChange(num, gridCols);
    }
  };

  const handleColsChange = (value: string) => {
    setColsInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      onGridChange(gridRows, num);
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Grid Size</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={10}
                value={rowsInput}
                onChange={(e) => handleRowsChange(e.target.value)}
                className="w-16 h-8 text-center"
                placeholder="Rows"
              />
              <span className="text-muted-foreground">×</span>
              <Input
                type="number"
                min={1}
                max={10}
                value={colsInput}
                onChange={(e) => handleColsChange(e.target.value)}
                className="w-16 h-8 text-center"
                placeholder="Cols"
              />
            </div>
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
