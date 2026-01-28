import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";

export function EditModeToggle() {
  const { isAdmin } = useAuth();
  const { isEditMode, setIsEditMode } = useEditMode();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Only show for admins
  if (!isAdmin) return null;

  const handleToggleClick = () => {
    if (isEditMode) {
      // Exit edit mode immediately (no confirmation needed)
      setIsEditMode(false);
    } else {
      // Show confirmation before entering edit mode
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmEditMode = () => {
    setIsEditMode(true);
    setShowConfirmDialog(false);
  };

  return (
    <>
      {/* Toggle Button - positioned absolutely to not affect layout */}
      <div className="fixed top-4 right-20 z-50">
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={handleToggleClick}
          className={`
            flex items-center gap-1.5 h-8 px-3 shadow-md
            ${isEditMode 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-background border-border hover:bg-accent"
            }
          `}
        >
          {isEditMode ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Exit Edit</span>
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Edit</span>
            </>
          )}
        </Button>
      </div>

      {/* Active Edit Mode Indicator */}
      {isEditMode && (
        <div className="fixed top-14 right-20 z-50">
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            Edit Mode Active
          </Badge>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Edit Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Edit mode allows you to add, modify, and delete categories and items. 
              Changes will be saved automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEditMode}>
              Enter Edit Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
