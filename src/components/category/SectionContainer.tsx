import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { useEditMode } from "@/contexts/EditModeContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface SectionContainerProps {
  section: {
    id: string;
    name: string;
    icon: string;
    description?: string | null;
  };
  isAdmin: boolean;
  children: React.ReactNode;
  onEdit: (section: { id: string; name: string; icon: string; description?: string | null }) => void;
  onDelete: (id: string) => void;
}

export function SectionContainer({ 
  section, 
  isAdmin, 
  children, 
  onEdit, 
  onDelete 
}: SectionContainerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isEditMode } = useEditMode();

  const showEditControls = isAdmin && isEditMode;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center gap-2 mb-3 group">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-auto">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <div className="flex items-center gap-2 flex-1">
            <DynamicIcon name={section.icon} className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{section.name}</span>
            {section.description && (
              <span className="text-sm text-muted-foreground hidden md:inline">
                — {section.description}
              </span>
            )}
          </div>

          {showEditControls && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(section)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <CollapsibleContent>
          <div className="pl-6 border-l-2 border-muted ml-2">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the "{section.name}" section. Items within the section will become ungrouped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(section.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
