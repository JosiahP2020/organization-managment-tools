import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
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
      {/* Badge Toggle - positioned fixed to align with settings gear */}
      <div className="fixed top-4 right-24 z-50 flex items-center h-14">
        <Badge 
          variant={isEditMode ? "default" : "outline"}
          className={`
            cursor-pointer h-8 px-3 flex items-center gap-1.5 text-sm font-medium
            ${isEditMode 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-background border-border hover:bg-accent"
            }
          `}
          onClick={handleToggleClick}
        >
          {isEditMode ? (
            <>
              <LockOpen className="h-3.5 w-3.5" />
              <span>Editing</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Locked</span>
            </>
          )}
        </Badge>
      </div>

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
