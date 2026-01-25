import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, LockOpen, RotateCcw, Printer, ListOrdered, CheckSquare } from "lucide-react";

interface ChecklistSidebarProps {
  isLocked: boolean;
  hideCompleted: boolean;
  displayMode: "checkbox" | "numbered";
  onToggleHideCompleted: () => void;
  onToggleLock: () => void;
  onToggleDisplayMode: () => void;
  onReset: () => void;
  onPrint: () => void;
  canEdit: boolean;
}

export function ChecklistSidebar({
  isLocked,
  hideCompleted,
  displayMode,
  onToggleHideCompleted,
  onToggleLock,
  onToggleDisplayMode,
  onReset,
  onPrint,
  canEdit,
}: ChecklistSidebarProps) {
  return (
    <Card className="w-64 shrink-0 h-fit sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hide Completed Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hideCompleted ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="hide-completed" className="text-sm cursor-pointer">
              Hide Completed
            </Label>
          </div>
          <Switch
            id="hide-completed"
            checked={hideCompleted}
            onCheckedChange={onToggleHideCompleted}
          />
        </div>

        {/* Lock Toggle - Admin only */}
        {canEdit && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <LockOpen className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="lock-checklist" className="text-sm cursor-pointer">
                {isLocked ? "Unlock" : "Lock"}
              </Label>
            </div>
            <Switch
              id="lock-checklist"
              checked={isLocked}
              onCheckedChange={onToggleLock}
            />
          </div>
        )}

        {/* Display Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {displayMode === "numbered" ? (
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
            ) : (
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="display-mode" className="text-sm cursor-pointer">
              {displayMode === "numbered" ? "Numbered" : "Checkboxes"}
            </Label>
          </div>
          <Switch
            id="display-mode"
            checked={displayMode === "numbered"}
            onCheckedChange={onToggleDisplayMode}
          />
        </div>

        <div className="border-t pt-4 space-y-2">
          {/* Reset Button - Admin only */}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onReset}
              disabled={isLocked}
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          )}

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
      </CardContent>
    </Card>
  );
}
