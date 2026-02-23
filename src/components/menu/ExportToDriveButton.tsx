import { useState } from "react";
import { Upload, Loader2, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { DriveFolderPickerDialog } from "./DriveFolderPickerDialog";

interface ExportToDriveButtonProps {
  entityId: string;
  entityType: string;
  isExporting: boolean;
  lastSynced: string | null;
  onExport: (folderId?: string) => void;
}

export function ExportToDriveButton({
  entityId,
  entityType,
  isExporting,
  lastSynced,
  onExport,
}: ExportToDriveButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const label = lastSynced
    ? `Synced ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}`
    : "Export to Drive";

  const handleExport = (folderId: string, _folderName: string) => {
    onExport(folderId);
    setPickerOpen(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 group-hover:bg-accent shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setPickerOpen(true);
              }}
              disabled={isExporting}
              title={label}
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : lastSynced ? (
                <CloudUpload className="h-3.5 w-3.5" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <DriveFolderPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleExport}
          isExporting={isExporting}
        />
      </div>
    </>
  );
}
