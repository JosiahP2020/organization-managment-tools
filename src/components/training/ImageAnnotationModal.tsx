import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Minus,
  ArrowRight,
  Circle,
  Square,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type Tool = "pen" | "line" | "arrow" | "circle" | "rectangle" | "text" | "eraser";

export interface DrawingAction {
  id: string;
  tool: Tool;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  color: string;
  thickness: number;
  text?: string;
}

interface ImageAnnotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  initialAnnotations: DrawingAction[];
  onSave: (annotations: DrawingAction[]) => void;
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#000000", // black
  "#ffffff", // white
];

const TOOLS: { tool: Tool; icon: React.ElementType; label: string }[] = [
  { tool: "pen", icon: Pencil, label: "Pen" },
  { tool: "line", icon: Minus, label: "Line" },
  { tool: "arrow", icon: ArrowRight, label: "Arrow" },
  { tool: "circle", icon: Circle, label: "Circle" },
  { tool: "rectangle", icon: Square, label: "Rectangle" },
  { tool: "text", icon: Type, label: "Text" },
  { tool: "eraser", icon: Eraser, label: "Eraser" },
];

export function ImageAnnotationModal({
  open,
  onOpenChange,
  imageUrl,
  initialAnnotations,
  onSave,
}: ImageAnnotationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedTool, setSelectedTool] = useState<Tool>("pen");
  const [selectedColor, setSelectedColor] = useState("#ef4444");
  const [thickness, setThickness] = useState(3);
  const [history, setHistory] = useState<DrawingAction[]>(initialAnnotations || []);
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Load image and set canvas dimensions
  useEffect(() => {
    if (!open || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  // Redraw canvas when history changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw all actions from history
      history.forEach((action) => {
        drawAction(ctx, action);
      });

      // Draw current action if any
      if (currentAction) {
        drawAction(ctx, currentAction);
      }
    };
    img.src = imageUrl;
  }, [history, currentAction, imageUrl, imageLoaded]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawingAction) => {
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

          // Arrowhead
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
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);

    const newAction: DrawingAction = {
      id: crypto.randomUUID(),
      tool: selectedTool,
      color: selectedColor,
      thickness,
      start: coords,
      points: selectedTool === "pen" || selectedTool === "eraser" ? [coords] : undefined,
    };

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        newAction.text = text;
        setHistory([...history, newAction]);
        setRedoStack([]);
      }
      setIsDrawing(false);
      return;
    }

    setCurrentAction(newAction);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;

    const coords = getCanvasCoords(e);

    if (selectedTool === "pen" || selectedTool === "eraser") {
      setCurrentAction({
        ...currentAction,
        points: [...(currentAction.points || []), coords],
      });
    } else {
      setCurrentAction({
        ...currentAction,
        end: coords,
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentAction) {
      if (selectedTool === "pen" || selectedTool === "eraser") {
        if (currentAction.points && currentAction.points.length > 1) {
          setHistory([...history, currentAction]);
          setRedoStack([]);
        }
      } else if (currentAction.start && currentAction.end) {
        setHistory([...history, currentAction]);
        setRedoStack([]);
      }
    }
    setIsDrawing(false);
    setCurrentAction(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setRedoStack([...redoStack, lastAction]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setHistory([...history, action]);
  };

  const handleClearAll = () => {
    setHistory([]);
    setRedoStack([]);
    setClearConfirmOpen(false);
  };

  const handleSave = () => {
    onSave(history);
    onOpenChange(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === "z") {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, history, redoStack]);

  // Calculate canvas size to fit in modal
  const maxWidth = 800;
  const maxHeight = 500;
  let canvasWidth = imageDimensions.width;
  let canvasHeight = imageDimensions.height;

  if (canvasWidth > maxWidth) {
    const ratio = maxWidth / canvasWidth;
    canvasWidth = maxWidth;
    canvasHeight = canvasHeight * ratio;
  }
  if (canvasHeight > maxHeight) {
    const ratio = maxHeight / canvasHeight;
    canvasHeight = maxHeight;
    canvasWidth = canvasWidth * ratio;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Annotate Image</DialogTitle>
          </DialogHeader>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
            {/* Drawing Tools */}
            <div className="flex gap-1">
              {TOOLS.map(({ tool, icon: Icon, label }) => (
                <Button
                  key={tool}
                  variant={selectedTool === tool ? "default" : "outline"}
                  size="icon"
                  onClick={() => setSelectedTool(tool)}
                  title={label}
                  className="h-9 w-9"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Undo/Redo */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Undo (Ctrl+Z)"
                className="h-9 w-9"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo (Ctrl+Shift+Z)"
                className="h-9 w-9"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Clear All */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setClearConfirmOpen(true)}
              disabled={history.length === 0}
              title="Clear All"
              className="h-9 w-9 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            {/* Colors */}
            <div className="flex gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform",
                    selectedColor === color
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden"
          >
            {imageLoaded ? (
              <canvas
                ref={canvasRef}
                width={imageDimensions.width}
                height={imageDimensions.height}
                style={{ width: canvasWidth, height: canvasHeight }}
                className="cursor-crosshair border rounded shadow-sm"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            ) : (
              <div className="text-muted-foreground">Loading image...</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Annotations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Annotations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all annotations? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClearAll}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
