import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuickCategoryDialog } from "./QuickCategoryDialog";
import { useEditMode } from "@/contexts/EditModeContext";

interface AddCategoryCardProps {
  onCreate: (data: { name: string; description?: string; icon: string; show_on_dashboard: boolean; show_in_sidebar: boolean }) => void;
}

export function AddCategoryCard({ onCreate }: AddCategoryCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { isEditMode } = useEditMode();

  // Only show in edit mode
  if (!isEditMode) return null;

  return (
    <>
      {/* Ghost Button Style - matching the card height */}
      <Button
        variant="outline"
        className="w-full h-full min-h-[72px] md:min-h-[82px] border-2 border-dashed border-muted-foreground/30 bg-transparent hover:border-primary/50 hover:bg-accent/20 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        onClick={() => setShowDialog(true)}
      >
        <Plus className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">Add Category</span>
      </Button>

      {/* Create Dialog */}
      <QuickCategoryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        mode="create"
        onSave={(data) => {
          onCreate(data);
          setShowDialog(false);
        }}
      />
    </>
  );
}
