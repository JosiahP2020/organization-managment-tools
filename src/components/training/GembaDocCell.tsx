import { useState, useRef } from "react";
import { Upload, Trash2, Pencil, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GembaDocCellProps {
  imageUrl: string | null;
  imageAnnotations: object[] | null;
  stepNumber: string | null;
  stepText: string | null;
  position: number;
  isLocked: boolean;
  isAdmin: boolean;
  onImageUpload: (file: File) => void;
  onImageDelete: () => void;
  onAnnotate: () => void;
  onStepNumberChange: (value: string) => void;
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
  onStepNumberChange,
  onStepTextChange,
  isUploading = false,
}: GembaDocCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleTap = () => {
    if (!isLocked && isAdmin) {
      setIsTapped((prev) => !prev);
    }
  };

  const showActions = (isHovered || isTapped) && !isLocked && isAdmin;
  const canEdit = !isLocked && isAdmin;

  return (
    <div
      className="relative flex flex-col border rounded-lg bg-card overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
    >
      {/* Step Number Badge */}
      <div className="absolute top-2 left-2 z-10">
        {canEdit ? (
          <Input
            value={stepNumber || ""}
            onChange={(e) => onStepNumberChange(e.target.value)}
            placeholder="#"
            className="w-12 h-8 text-center font-bold text-sm bg-background/90 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          stepNumber && (
            <div className="w-auto min-w-[2rem] h-8 px-2 flex items-center justify-center font-bold text-sm bg-primary text-primary-foreground rounded-md">
              {stepNumber}
            </div>
          )
        )}
      </div>

      {/* Image Area */}
      <div className="relative flex-1 min-h-[120px] flex items-center justify-center bg-muted/50">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`Step ${stepNumber || position + 1}`}
              className="w-full h-full object-contain"
            />
            {/* Render annotations if any */}
            {imageAnnotations && imageAnnotations.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Annotation overlay would be rendered here */}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Upload/Delete/Annotate Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2">
            {!imageUrl ? (
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotate();
                  }}
                  title="Edit/Annotate"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete();
                  }}
                  title="Delete Image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Delete button always visible on hover for images */}
        {imageUrl && isHovered && !isLocked && isAdmin && !showActions && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onImageDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Step Text Area */}
      <div className="p-2 border-t">
        {canEdit ? (
          <Textarea
            value={stepText || ""}
            onChange={(e) => onStepTextChange(e.target.value)}
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
