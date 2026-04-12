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
  Move,
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
  fontSize?: number;
}

interface ImageAnnotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  initialAnnotations: DrawingAction[];
  onSave: (annotations: DrawingAction[]) => void;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#000000",
  "#ffffff",
];

const TEXT_SIZES = [
  { label: "S", value: 18 },
  { label: "M", value: 28 },
  { label: "L", value: 40 },
  { label: "XL", value: 56 },
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
  const [textSize, setTextSize] = useState(28);
  const [history, setHistory] = useState<DrawingAction[]>(initialAnnotations || []);
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Text input state
  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    value: string;
    editingId?: string; // if editing an existing text action
  }>({ visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0, value: "" });
  const textInputRef = useRef<HTMLInputElement>(null);
  const textBlurEnabled = useRef(false);

  // Dragging text input
  const [isDraggingText, setIsDraggingText] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

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

  const getCanvasScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { scaleX: 1, scaleY: 1 };
    const rect = canvas.getBoundingClientRect();
    return {
      scaleX: canvas.width / rect.width,
      scaleY: canvas.height / rect.height,
    };
  }, []);

  // Redraw canvas when history changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      history.forEach((action) => {
        // Skip drawing text that's currently being edited
        if (action.id === textInput.editingId) return;
        drawAction(ctx, action);
      });

      if (currentAction) {
        drawAction(ctx, currentAction);
      }
    };
    img.src = imageUrl;
  }, [history, currentAction, imageUrl, imageLoaded, textInput.editingId]);

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
          action.points.forEach((point) => ctx.lineTo(point.x, point.y));
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
          const angle = Math.atan2(action.end.y - action.start.y, action.end.x - action.start.x);
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
            Math.pow(action.end.x - action.start.x, 2) + Math.pow(action.end.y - action.start.y, 2)
          );
          ctx.beginPath();
          ctx.arc(action.start.x, action.start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
      case "rectangle":
        if (action.start && action.end) {
          ctx.beginPath();
          ctx.strokeRect(action.start.x, action.start.y, action.end.x - action.start.x, action.end.y - action.start.y);
        }
        break;
      case "text":
        if (action.start && action.text) {
          const fs = action.fontSize || 28;
          ctx.font = `bold ${fs}px sans-serif`;
          ctx.fillText(action.text, action.start.x, action.start.y);
        }
        break;
      case "eraser":
        if (action.points && action.points.length > 0) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach((point) => ctx.lineTo(point.x, point.y));
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

  const findTextActionAtCoords = (canvasX: number, canvasY: number): DrawingAction | null => {
    // Check history in reverse to find topmost text
    for (let i = history.length - 1; i >= 0; i--) {
      const action = history[i];
      if (action.tool === "text" && action.start && action.text) {
        const fs = action.fontSize || 28;
        const x = action.start.x;
        const y = action.start.y;
        // Approximate hit box: text baseline is at y, text extends upward by fontSize
        const textWidth = action.text.length * fs * 0.6; // rough estimate
        if (
          canvasX >= x - 5 &&
          canvasX <= x + textWidth + 5 &&
          canvasY >= y - fs - 5 &&
          canvasY <= y + 10
        ) {
          return action;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (selectedTool === "text") {
      // First check if clicking on existing text to edit it
      const existingText = findTextActionAtCoords(coords.x, coords.y);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;

      if (existingText && existingText.start) {
        // Edit existing text
        const { scaleX, scaleY } = getCanvasScale();
        textBlurEnabled.current = false;
        setTextInput({
          visible: true,
          x: existingText.start.x / scaleX,
          y: (existingText.start.y / scaleY) - 8,
          canvasX: existingText.start.x,
          canvasY: existingText.start.y,
          value: existingText.text || "",
          editingId: existingText.id,
        });
        setTextSize(existingText.fontSize || 28);
        setSelectedColor(existingText.color);
        setTimeout(() => {
          textInputRef.current?.focus();
          setTimeout(() => { textBlurEnabled.current = true; }, 200);
        }, 100);
      } else {
        // New text at click position
        textBlurEnabled.current = false;
        setTextInput({
          visible: true,
          x: displayX,
          y: displayY - 8,
          canvasX: coords.x,
          canvasY: coords.y,
          value: "",
        });
        setTimeout(() => {
          textInputRef.current?.focus();
          setTimeout(() => { textBlurEnabled.current = true; }, 200);
        }, 100);
      }
      setIsDrawing(false);
      return;
    }

    setIsDrawing(true);
    const newAction: DrawingAction = {
      id: crypto.randomUUID(),
      tool: selectedTool,
      color: selectedColor,
      thickness,
      start: coords,
      points: selectedTool === "pen" || selectedTool === "eraser" ? [coords] : undefined,
    };
    setCurrentAction(newAction);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;
    const coords = getCanvasCoords(e);
    if (selectedTool === "pen" || selectedTool === "eraser") {
      setCurrentAction({ ...currentAction, points: [...(currentAction.points || []), coords] });
    } else {
      setCurrentAction({ ...currentAction, end: coords });
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

  const commitTextInput = () => {
    if (textInput.value.trim()) {
      if (textInput.editingId) {
        // Update existing text action
        setHistory(history.map(a =>
          a.id === textInput.editingId
            ? { ...a, text: textInput.value.trim(), color: selectedColor, fontSize: textSize, start: { x: textInput.canvasX, y: textInput.canvasY } }
            : a
        ));
      } else {
        const newAction: DrawingAction = {
          id: crypto.randomUUID(),
          tool: "text",
          color: selectedColor,
          thickness,
          fontSize: textSize,
          start: { x: textInput.canvasX, y: textInput.canvasY },
          text: textInput.value.trim(),
        };
        setHistory([...history, newAction]);
        setRedoStack([]);
      }
    } else if (textInput.editingId) {
      // If editing and cleared text, remove it
      setHistory(history.filter(a => a.id !== textInput.editingId));
    }
    setTextInput({ visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0, value: "" });
  };

  const handleSave = () => {
    let finalHistory = history;
    if (textInput.visible && textInput.value.trim()) {
      if (textInput.editingId) {
        finalHistory = history.map(a =>
          a.id === textInput.editingId
            ? { ...a, text: textInput.value.trim(), color: selectedColor, fontSize: textSize, start: { x: textInput.canvasX, y: textInput.canvasY } }
            : a
        );
      } else {
        const newAction: DrawingAction = {
          id: crypto.randomUUID(),
          tool: "text",
          color: selectedColor,
          thickness,
          fontSize: textSize,
          start: { x: textInput.canvasX, y: textInput.canvasY },
          text: textInput.value.trim(),
        };
        finalHistory = [...history, newAction];
      }
    }
    setTextInput({ visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0, value: "" });
    onSave(finalHistory);
    onOpenChange(false);
  };

  // Text drag handlers
  const handleTextDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingText(true);
    dragOffset.current = {
      x: e.clientX - textInput.x,
      y: e.clientY - textInput.y,
    };
  };

  useEffect(() => {
    if (!isDraggingText) return;

    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const { scaleX, scaleY } = getCanvasScale();
      // Clamp within canvas
      const clampedX = Math.max(0, Math.min(newX, rect.width - 50));
      const clampedY = Math.max(0, Math.min(newY, rect.height - 20));
      setTextInput(prev => ({
        ...prev,
        x: clampedX,
        y: clampedY,
        canvasX: clampedX * scaleX,
        canvasY: (clampedY + 8) * scaleY,
      }));
    };

    const handleUp = () => {
      setIsDraggingText(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDraggingText, getCanvasScale]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (textInput.visible) return; // Don't interfere with text input
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
  }, [open, history, redoStack, textInput.visible]);

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

  const isTextTool = selectedTool === "text";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Annotate Image</DialogTitle>
          </DialogHeader>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
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

            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={handleUndo} disabled={history.length === 0} title="Undo (Ctrl+Z)" className="h-9 w-9">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo (Ctrl+Shift+Z)" className="h-9 w-9">
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

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
                    selectedColor === color ? "border-primary scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Thickness / Text Size controls */}
          <div className="flex items-center gap-3 px-2">
            {isTextTool ? (
              <>
                <span className="text-xs text-muted-foreground whitespace-nowrap">Text Size</span>
                <div className="flex gap-1">
                  {TEXT_SIZES.map((s) => (
                    <Button
                      key={s.value}
                      variant={textSize === s.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextSize(s.value)}
                      className="h-7 px-3 text-xs"
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Click existing text to edit it</span>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground whitespace-nowrap">Thickness</span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={thickness}
                  onChange={(e) => setThickness(Number(e.target.value))}
                  className="flex-1 h-2 accent-primary"
                />
                <div
                  className="rounded-full bg-foreground shrink-0"
                  style={{ width: thickness * 2, height: thickness * 2, minWidth: 4, minHeight: 4 }}
                />
              </>
            )}
          </div>

          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden"
          >
            {imageLoaded ? (
              <div className="relative">
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
                {/* In-app text input overlay */}
                {textInput.visible && (
                  <div
                    className="absolute z-20 flex items-center gap-1"
                    style={{
                      left: textInput.x,
                      top: textInput.y,
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {/* Drag handle */}
                    <div
                      className="cursor-move p-1 bg-muted rounded hover:bg-muted-foreground/20 shrink-0"
                      onMouseDown={handleTextDragStart}
                      title="Drag to reposition"
                    >
                      <Move className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInput.value}
                      onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          commitTextInput();
                        } else if (e.key === "Escape") {
                          setTextInput({ visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0, value: "" });
                        }
                      }}
                      onBlur={() => {
                        if (textBlurEnabled.current && !isDraggingText) {
                          commitTextInput();
                        }
                      }}
                      className="bg-background border-2 border-primary rounded px-2 py-1 text-foreground min-w-[150px] shadow-lg outline-none font-bold"
                      style={{
                        color: selectedColor,
                        fontSize: `${Math.max(14, textSize * 0.6)}px`,
                      }}
                      placeholder="Type text, press Enter"
                      autoFocus
                    />
                  </div>
                )}
              </div>
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
