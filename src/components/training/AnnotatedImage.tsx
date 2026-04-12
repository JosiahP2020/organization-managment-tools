import { useEffect, useRef, useState } from "react";
import type { DrawingAction } from "./ImageAnnotationModal";

interface AnnotatedImageProps {
  src: string;
  annotations: DrawingAction[];
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders an image with annotations baked in using a hidden canvas.
 * Outputs a composite data URL so annotations appear everywhere (grid, print, etc).
 */
export function AnnotatedImage({ src, annotations, alt, className, style }: AnnotatedImageProps) {
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src || !annotations || annotations.length === 0) {
      setCompositeUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Draw each annotation
      annotations.forEach((action) => {
        drawAction(ctx, action);
      });

      try {
        const dataUrl = canvas.toDataURL("image/png");
        setCompositeUrl(dataUrl);
      } catch {
        // CORS or other error - fall back to original
        setCompositeUrl(null);
      }
    };
    img.onerror = () => {
      setCompositeUrl(null);
    };
    img.src = src;
  }, [src, annotations]);

  const displaySrc = compositeUrl || src;

  return <img src={displaySrc} alt={alt || ""} className={className} style={style} />;
}

function drawAction(ctx: CanvasRenderingContext2D, action: DrawingAction) {
  ctx.strokeStyle = action.color;
  ctx.fillStyle = action.color;
  ctx.lineWidth = action.thickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (action.tool) {
    case "pen":
      if (action.points && action.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
      break;
    case "line":
      if (action.start && action.end) {
        ctx.beginPath();
        ctx.moveTo(action.start.x, action.start.y);
        ctx.lineTo(action.end.x, action.end.y);
        ctx.stroke();
      }
      break;
    case "arrow":
      if (action.start && action.end) {
        const headLength = 15;
        const angle = Math.atan2(
          action.end.y - action.start.y,
          action.end.x - action.start.x
        );
        ctx.beginPath();
        ctx.moveTo(action.start.x, action.start.y);
        ctx.lineTo(action.end.x, action.end.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(action.end.x, action.end.y);
        ctx.lineTo(
          action.end.x - headLength * Math.cos(angle - Math.PI / 6),
          action.end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(action.end.x, action.end.y);
        ctx.lineTo(
          action.end.x - headLength * Math.cos(angle + Math.PI / 6),
          action.end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
      break;
    case "circle":
      if (action.start && action.end) {
        const radius = Math.sqrt(
          Math.pow(action.end.x - action.start.x, 2) +
            Math.pow(action.end.y - action.start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(action.start.x, action.start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      break;
    case "rectangle":
      if (action.start && action.end) {
        const width = action.end.x - action.start.x;
        const height = action.end.y - action.start.y;
        ctx.beginPath();
        ctx.strokeRect(action.start.x, action.start.y, width, height);
      }
      break;
    case "text":
      if (action.start && action.text) {
        ctx.font = `${action.thickness * 6}px sans-serif`;
        ctx.fillText(action.text, action.start.x, action.start.y);
      }
      break;
    case "eraser":
      if (action.points && action.points.length > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineWidth = action.thickness * 3;
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
      break;
  }
}
