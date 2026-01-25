import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Trash2, Pencil, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GembaDocCellProps {
  imageUrl: string | null;
  imageAnnotations: object[] | null;
  stepNumber: number; // Now a simple number for display
  stepText: string | null;
  position: number;
  isLocked: boolean;
  isAdmin: boolean;
  onImageUpload: (file: File) => void;
  onImageDelete: () => void;
  onAnnotate: () => void;
  onStepTextChange: (value: string) => void;
  isUploading?: boolean;
}

export function GembaDocCell({
  imageUrl,
  imageAnnotations,
  stepNumber,
  stepText,
  position,
  isLocked,
  isAdmin,
  onImageUpload,
  onImageDelete,
  onAnnotate,
  onStepTextChange,
  isUploading = false,
}: GembaDocCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localText, setLocalText] = useState(stepText || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when prop changes (e.g., from server)
  useEffect(() => {
    setLocalText(stepText || "");
  }, [stepText]);

  // Debounced save function
  const debouncedSave = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onStepTextChange(value);
      }, 500); // 500ms debounce
    },
    [onStepTextChange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalText(value);
    debouncedSave(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canEdit = !isLocked && isAdmin;
  const showHoverActions = isHovered && canEdit && imageUrl;

  return (
    <div
      className="relative flex flex-col border rounded-lg bg-card overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Step Number Badge - Always visible, not editable */}
      <div className="absolute top-2 left-2 z-10">
        <div className="w-auto min-w-[2rem] h-8 px-2 flex items-center justify-center font-bold text-sm bg-primary text-primary-foreground rounded-md">
          {stepNumber}
        </div>
      </div>

      {/* Image Area */}
      <div className="relative flex-1 min-h-[120px] flex items-center justify-center bg-muted/50">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`Step ${stepNumber}`}
              className="w-full h-full object-contain"
            />
            {/* Render annotations if any */}
            {imageAnnotations && imageAnnotations.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Annotation overlay would be rendered here */}
              </div>
            )}
            
            {/* Hover action buttons - top right, no blur/overlay */}
            {showHoverActions && (
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotate();
                  }}
                  title="Edit/Annotate"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete();
                  }}
                  title="Delete Image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          // Empty state - show upload button if can edit
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            {canEdit ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">No image</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Step Text Area */}
      <div className="p-2 border-t">
        {canEdit ? (
          <Textarea
            value={localText}
            onChange={handleTextChange}
            placeholder="Enter step description..."
            className="min-h-[60px] text-sm resize-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="text-sm text-foreground min-h-[60px]">
            {stepText || <span className="text-muted-foreground">No description</span>}
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}