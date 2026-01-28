import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Pencil } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import type { MenuItem } from "@/hooks/useMenuItems";
import { EditMenuItemDialog } from "@/components/menu-config/EditMenuItemDialog";

interface EditableItemCardProps {
  item: MenuItem;
  isAdmin: boolean;
  onClick: () => void;
}

export function EditableItemCard({ item, isAdmin, onClick }: EditableItemCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { isEditMode } = useEditMode();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  // Show edit button only in edit mode for admins
  const showEditButton = isAdmin && isEditMode;

  const getTypeBadge = () => {
    if (item.item_type === "file_directory") return "Documents";
    if (item.item_type === "tool") {
      if (item.tool_type === "checklist") return "Checklist";
      if (item.tool_type === "sop_guide") return "SOP Guide";
      if (item.tool_type === "project_hub") return "Project Hub";
    }
    return item.item_type;
  };

  return (
    <>
      <Card
        className="group relative cursor-pointer shadow-sm border border-border/50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-200"
        onClick={onClick}
      >
        {/* Edit button - visible only in edit mode for admins */}
        {showEditButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 z-10 bg-background/80 hover:bg-background shadow-sm"
            onClick={handleEditClick}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}

        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <DynamicIcon name={item.icon} className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          {/* Type badge */}
          <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
            {getTypeBadge()}
          </span>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditMenuItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        item={item}
      />
    </>
  );
}
