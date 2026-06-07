import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-screen image viewer. Click image, backdrop, or close button to dismiss.
 */
export function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-0 m-0 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={() => onOpenChange(false)}
        >
          <DialogPrimitive.Title className="sr-only">{alt || "Image preview"}</DialogPrimitive.Title>
          {src && (
            <img
              src={src}
              alt={alt || "Preview"}
              className="w-screen h-screen object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <DialogPrimitive.Close className="fixed top-4 right-4 z-10 rounded-full bg-background/80 text-foreground p-2 hover:bg-background transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

