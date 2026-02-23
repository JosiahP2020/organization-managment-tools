import { Upload, Loader2, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface ExportToDriveButtonProps {
  entityId: string;
  entityType: string;
  isExporting: boolean;
  lastSynced: string | null;
  onExport: () => void;
}

export function ExportToDriveButton({
  entityId,
  entityType,
  isExporting,
  lastSynced,
  onExport,
}: ExportToDriveButtonProps) {
  const label = lastSynced
    ? `Synced ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}`
    : "Export to Drive";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onExport();
            }}
            disabled={isExporting}
            title={label}
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : lastSynced ? (
              <CloudUpload className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
