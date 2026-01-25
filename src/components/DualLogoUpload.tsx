import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Helper to extract file info from URL
function getFileInfoFromUrl(url: string | null): { name: string; type: string } | null {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || '';
    const extension = filename.split('.').pop()?.toUpperCase() || '';
    // Clean up the filename (remove timestamp prefix if present)
    const cleanName = filename.replace(/^\d+-/, '').replace(/-\d+\./, '.');
    return { name: cleanName, type: extension };
  } catch {
    return null;
  }
}

interface DualLogoUploadProps {
  mainLogoUrl: string | null;
  subLogoUrl: string | null;
  organizationId: string;
  onMainLogoChange: (url: string | null) => void;
  onSubLogoChange: (url: string | null) => void;
  mainLabel?: string;
  subLabel?: string;
}

interface SingleLogoUploadProps {
  label: string;
  description: string;
  currentUrl: string | null;
  organizationId: string;
  filePrefix: string;
  onUploadComplete: (url: string | null) => void;
}

function SingleLogoUpload({ 
  label, 
  description, 
  currentUrl, 
  organizationId, 
  filePrefix,
  onUploadComplete 
}: SingleLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync previewUrl when currentUrl prop changes (e.g., when organization data loads)
  useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, GIF, WebP, or SVG image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${organizationId}/${filePrefix}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Logo uploaded",
        description: `${label} has been uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    onUploadComplete(null);
  };

  const fileInfo = getFileInfoFromUrl(previewUrl);

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-foreground">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          {/* File info display */}
          {fileInfo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5">
              <FileImage className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[140px]" title={fileInfo.name}>
                {fileInfo.name}
              </span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium flex-shrink-0">
                {fileInfo.type}
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {previewUrl ? "Change" : "Upload"}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={isUploading}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DualLogoUpload({ 
  mainLogoUrl, 
  subLogoUrl, 
  organizationId, 
  onMainLogoChange, 
  onSubLogoChange,
  mainLabel = "Main Logo",
  subLabel = "Sidebar Logo (Sub-Logo)"
}: DualLogoUploadProps) {
  return (
    <div className="space-y-6">
      <SingleLogoUpload
        label={mainLabel}
        description="Displayed on the dashboard page. Recommended: Wide/horizontal format, min 400x200px"
        currentUrl={mainLogoUrl}
        organizationId={organizationId}
        filePrefix="main-logo"
        onUploadComplete={onMainLogoChange}
      />
      
      <div className="border-t border-border pt-6">
        <SingleLogoUpload
          label={subLabel}
          description="Displayed in the side menu panel. Recommended: Square or compact, min 200x200px"
          currentUrl={subLogoUrl}
          organizationId={organizationId}
          filePrefix="sub-logo"
          onUploadComplete={onSubLogoChange}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Max 5MB per image. Supported: PNG, JPG, GIF, WebP, SVG.
      </p>
    </div>
  );
}
