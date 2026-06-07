import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-screen image viewer. Click image or backdrop to close.
 */
export function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-fit p-2 bg-background border-border sm:rounded-lg"
        onClick={() => onOpenChange(false)}
      >
        <DialogTitle className="sr-only">{alt || "Image preview"}</DialogTitle>
        {src && (
          <img
            src={src}
            alt={alt || "Preview"}
            className="max-h-[90vh] max-w-full w-auto h-auto object-contain rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
