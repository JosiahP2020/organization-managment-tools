import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Eye, EyeOff, Lock, LockOpen, RotateCcw, Printer, Image, ImageOff, Settings2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface ChecklistSidebarProps {
  isLocked: boolean;
  hideCompleted: boolean;
  hideAllImages: boolean;
  hasAnyImages: boolean;
  onToggleHideCompleted: () => void;
  onToggleHideImages: () => void;
  onToggleLock: () => void;
  onReset: () => void;
  onPrint: () => void;
  canEdit: boolean;
}

function SidebarContent({
  isLocked,
  hideCompleted,
  hideAllImages,
  hasAnyImages,
  onToggleHideCompleted,
  onToggleHideImages,
  onToggleLock,
  onReset,
  onPrint,
  canEdit,
}: ChecklistSidebarProps) {
  return (
    <div className="space-y-4">
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
              {isLocked ? "Unlock List" : "Lock List"}
            </Label>
          </div>
          <Switch
            id="lock-checklist"
            checked={isLocked}
            onCheckedChange={onToggleLock}
          />
        </div>
      )}

      {/* Show Section Images Toggle */}
      {hasAnyImages && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hideAllImages ? (
              <ImageOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Image className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="show-images" className="text-sm cursor-pointer">
              Show Images
            </Label>
          </div>
          <Switch
            id="show-images"
            checked={!hideAllImages}
            onCheckedChange={() => onToggleHideImages()}
          />
        </div>
      )}

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
    </div>
  );
}

export function ChecklistSidebar(props: ChecklistSidebarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background border-border"
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>Actions</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SidebarContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="w-64 shrink-0 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <SidebarContent {...props} />
      </CardContent>
    </Card>
  );
}
