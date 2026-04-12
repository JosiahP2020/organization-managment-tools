import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, Printer, HelpCircle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface PipeDrawerEntry {
  id: string;
  mid: string;
  left: string;
  right: string;
  slides_length: string;
  drawer_height: string;
  drawer_label: string;
  quantity: number;
}

interface PipeDrawerDiagramProps {
  title?: string;
  entries: PipeDrawerEntry[];
  isLoading: boolean;
  onAddEntry: (entry: Omit<PipeDrawerEntry, "id">) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<PipeDrawerEntry>) => void;
}

// Helper: parse mixed number/fraction strings like "17 1/2"
const parseMixedNumber = (input: string): number => {
  if (!input.trim()) return 0;
  const mixedMatch = input.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  const fractionMatch = input.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  return parseFloat(input) || 0;
};

const toMixedNumber = (decimal: number): string => {
  if (decimal === Math.floor(decimal)) return decimal.toString();
  const whole = Math.floor(decimal);
  const fractional = decimal - whole;
  const fractions = [
    { decimal: 0.125, fraction: "1/8" }, { decimal: 0.25, fraction: "1/4" },
    { decimal: 0.375, fraction: "3/8" }, { decimal: 0.5, fraction: "1/2" },
    { decimal: 0.625, fraction: "5/8" }, { decimal: 0.75, fraction: "3/4" },
    { decimal: 0.875, fraction: "7/8" },
  ];
  const closest = fractions.reduce((prev, curr) =>
    Math.abs(curr.decimal - fractional) < Math.abs(prev.decimal - fractional) ? curr : prev
  );
  if (Math.abs(closest.decimal - fractional) < 0.01) {
    return whole > 0 ? `${whole} ${closest.fraction}` : closest.fraction;
  }
  return decimal.toString();
};

const PipeDrawerDiagram = ({
  title, entries, isLoading, onAddEntry, onDeleteEntry, onUpdateEntry
}: PipeDrawerDiagramProps) => {
  const [formData, setFormData] = useState({
    mid: "", left: "", right: "", slidesLength: "", drawerHeight: "", drawerLabel: "", quantity: ""
  });

  const scale = 120;
  const svgWidth = 600;
  const svgHeight = 400;
  const diagramWidth = 3 * scale;
  const diagramHeight = 2 * scale;
  const startX = (svgWidth - diagramWidth) / 2;
  const startY = (svgHeight - diagramHeight) / 2;

  const points = [
    { x: startX, y: startY },
    { x: startX, y: startY + 2 * scale },
    { x: startX + 3 * scale, y: startY + 2 * scale },
    { x: startX + 3 * scale, y: startY },
    { x: startX + 2 * scale, y: startY },
    { x: startX + 2 * scale, y: startY + 1 * scale },
    { x: startX + 1 * scale, y: startY + 1 * scale },
    { x: startX + 1 * scale, y: startY },
    { x: startX, y: startY },
  ];
  const pathData = `M ${points[0].x} ${points[0].y} ` +
    points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.mid && !formData.left && !formData.right && !formData.slidesLength && !formData.drawerHeight && !formData.drawerLabel) return;

    let processedLeft = formData.left;
    let processedRight = formData.right;
    let processedMid = formData.mid;

    if (formData.left !== "") {
      const n = parseMixedNumber(formData.left);
      if (!isNaN(n)) processedLeft = toMixedNumber(n - 1);
    }
    if (formData.right !== "") {
      const n = parseMixedNumber(formData.right);
      if (!isNaN(n)) processedRight = toMixedNumber(n - 1);
    }
    if (formData.mid !== "") {
      const n = parseMixedNumber(formData.mid);
      if (!isNaN(n)) processedMid = n >= 6 ? "6" : formData.mid;
    }

    onAddEntry({
      mid: processedMid,
      left: processedLeft,
      right: processedRight,
      slides_length: formData.slidesLength,
      drawer_height: formData.drawerHeight,
      drawer_label: formData.drawerLabel,
      quantity: parseInt(formData.quantity) || 1,
    });

    setFormData({ mid: "", left: "", right: "", slidesLength: "", drawerHeight: "", drawerLabel: "", quantity: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
  };

  const handlePrint = () => {
    if (entries.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const diagramsHtml = entries.map((entry) => {
      const s = 80, sw = 400, sh = 250;
      const dw = 3 * s, dh = 2 * s;
      const sx = (sw - dw) / 2, sy = (sh - dh) / 2;
      const pts = [
        { x: sx, y: sy }, { x: sx, y: sy + 2 * s }, { x: sx + 3 * s, y: sy + 2 * s },
        { x: sx + 3 * s, y: sy }, { x: sx + 2 * s, y: sy }, { x: sx + 2 * s, y: sy + s },
        { x: sx + s, y: sy + s }, { x: sx + s, y: sy }, { x: sx, y: sy },
      ];
      const pd = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");

      return `
        <div style="padding:20px;page-break-inside:avoid;margin-bottom:30px;">
          <h2 style="text-align:center;margin:0 0 5px;font-size:22px;">${entry.drawer_label || "N/A"}</h2>
          <p style="text-align:center;color:#666;font-size:18px;margin:0 0 15px;">Quantity: ${entry.quantity}</p>
          <div style="position:relative;display:flex;justify-content:center;">
            <svg width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}">
              <path d="${pd}" fill="none" stroke="#f97316" stroke-width="3" stroke-linejoin="round"/>
            </svg>
            <div style="position:absolute;left:50%;top:${sy - 30}px;transform:translateX(calc(-50% - ${s}px));">
              <div style="width:70px;text-align:center;font-weight:bold;">${entry.left ? `${entry.left}"` : "N/A"}</div>
            </div>
            <div style="position:absolute;left:50%;top:${sy - 30}px;transform:translateX(calc(-50% + ${s}px));">
              <div style="width:70px;text-align:center;font-weight:bold;">${entry.right ? `${entry.right}"` : "N/A"}</div>
            </div>
            <div style="position:absolute;left:50%;top:${sy + 1.5 * s}px;transform:translate(-50%,-50%);">
              <div style="width:70px;text-align:center;font-weight:bold;">${entry.mid ? `${entry.mid}"` : "N/A"}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;text-align:center;font-size:16px;margin-top:15px;">
            <div><span style="color:#666;">Slides Length:</span><div style="font-weight:bold;">${entry.slides_length ? `${entry.slides_length}"` : "N/A"}</div></div>
            <div><span style="color:#666;">Drawer Height:</span><div style="font-weight:bold;">${entry.drawer_height ? `${entry.drawer_height}"` : "N/A"}</div></div>
          </div>
        </div>`;
    }).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Pipe Drawer Diagrams</title>
      <style>body{margin:0;font-family:Arial,sans-serif}@media print{.diagram-container{page-break-inside:avoid}*{-webkit-print-color-adjust:exact!important;color-adjust:exact!important}}</style>
      </head><body><div style="padding:20px;"><h1 style="text-align:center;margin-bottom:30px;">${title || "Pipe Drawer Measurements"}</h1>${diagramsHtml}</div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const renderSmallDiagram = (entry: PipeDrawerEntry) => {
    const s = 60, sw = 300, sh = 200;
    const dw = 3 * s, sx = (sw - dw) / 2, sy = (sh - 2 * s) / 2;
    const pts = [
      { x: sx, y: sy }, { x: sx, y: sy + 2 * s }, { x: sx + 3 * s, y: sy + 2 * s },
      { x: sx + 3 * s, y: sy }, { x: sx + 2 * s, y: sy }, { x: sx + 2 * s, y: sy + s },
      { x: sx + s, y: sy + s }, { x: sx + s, y: sy }, { x: sx, y: sy },
    ];
    const pd = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");

    return (
      <div className="flex justify-center items-center">
        <div className="relative">
          <svg width={sw} height={sh} className="border border-border rounded" viewBox={`0 0 ${sw} ${sh}`}>
            <path d={pd} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          {/* Left */}
          <div className="absolute" style={{ left: `${sx + 0.5 * s}px`, top: `${sy - 25}px`, transform: "translateX(-50%)" }}>
            <div className="w-16 h-6 text-xs bg-background border border-border rounded text-center flex items-center justify-center font-medium text-foreground">
              {entry.left ? `${entry.left}"` : "N/A"}
            </div>
          </div>
          {/* Right */}
          <div className="absolute" style={{ left: `${sx + 2.5 * s}px`, top: `${sy - 25}px`, transform: "translateX(-50%)" }}>
            <div className="w-16 h-6 text-xs bg-background border border-border rounded text-center flex items-center justify-center font-medium text-foreground">
              {entry.right ? `${entry.right}"` : "N/A"}
            </div>
          </div>
          {/* Mid with arrows */}
          <div className="absolute" style={{ left: `${sx + 1.5 * s - 6}px`, top: `${sy + 1.5 * s - 25}px` }}>
            <ArrowUp className="w-3 h-3 text-primary" strokeWidth={2.5} />
          </div>
          <div className="absolute" style={{ left: `${sx + 1.5 * s - 6}px`, top: `${sy + 1.5 * s + 15}px` }}>
            <ArrowDown className="w-3 h-3 text-primary" strokeWidth={2.5} />
          </div>
          <div className="absolute" style={{ left: `${sx + 1.5 * s}px`, top: `${sy + 1.5 * s}px`, transform: "translate(-50%, -50%)" }}>
            <div className="w-16 h-6 text-xs bg-background border border-border rounded text-center flex items-center justify-center font-medium text-foreground">
              {entry.mid ? `${entry.mid}"` : "N/A"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start py-8">
      {/* Input section header */}
      <div className="relative flex justify-center items-center mb-2">
        <h2 className="text-2xl font-semibold text-foreground">Input</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="absolute left-full ml-2 h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>How to Measure for Pipe Drawers</DialogTitle></DialogHeader>
            <div className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground mb-4">Follow these three steps to accurately measure your cabinet for custom pipe drawers:</p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Step 1: Measure Left Side</h3>
                  <p className="text-muted-foreground mb-3">Using a measuring tape, measure from the left interior wall of the cabinet to the edge of the nearest pipe.</p>
                  <img src="/lovable-uploads/099a4b56-4b27-49f4-af35-4aca8d80dbd5.png" alt="Measuring from left side" className="w-full rounded-lg border border-border" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Step 2: Measure Right Side</h3>
                  <p className="text-muted-foreground mb-3">Repeat the same process on the right side.</p>
                  <img src="/lovable-uploads/66f147db-8b7f-47c5-80f7-48270cba220b.png" alt="Measuring from right side" className="w-full rounded-lg border border-border" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Step 3: Calculate Middle Depth</h3>
                  <p className="text-muted-foreground mb-3">Measure how far the pipes extend into the cabinet space.</p>
                  <img src="/lovable-uploads/2840b472-f881-4d0e-821f-a30bddaab5e4.png" alt="Measuring pipe protrusion" className="w-full rounded-lg border border-border" />
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-foreground">Important Notes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The system will automatically subtract 1" from left and right measurements for clearance</li>
                  <li>• Middle depth will be capped at 6" maximum</li>
                  <li>• Double-check all measurements before finalizing</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground mb-6 text-center">Subtractions are done automatically. Input measurements from cab to pipes</p>

      {/* Main diagram */}
      <div className="relative mb-8">
        <svg width={svgWidth} height={svgHeight} className="border border-border rounded" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <path d={pathData} fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinejoin="round" />
        </svg>

        {/* Mid arrows */}
        <div className="absolute" style={{ left: `${startX + 1.5 * scale - 12}px`, top: `${startY + 1.5 * scale - 50}px` }}>
          <ArrowUp className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </div>
        <div className="absolute" style={{ left: `${startX + 1.5 * scale - 12}px`, top: `${startY + 1.5 * scale + 30}px` }}>
          <ArrowDown className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </div>

        {/* Left input */}
        <div className="absolute" style={{ left: `${startX + 0.5 * scale}px`, top: `${startY - 50}px`, transform: "translateX(-50%)" }}>
          <Input type="text" placeholder="Left" value={formData.left} onChange={(e) => handleInputChange("left", e.target.value)} onKeyDown={handleKeyDown} className="w-20 h-8 text-xs text-center" />
        </div>
        {/* Right input */}
        <div className="absolute" style={{ left: `${startX + 2.5 * scale}px`, top: `${startY - 50}px`, transform: "translateX(-50%)" }}>
          <Input type="text" placeholder="Right" value={formData.right} onChange={(e) => handleInputChange("right", e.target.value)} onKeyDown={handleKeyDown} className="w-20 h-8 text-xs text-center" />
        </div>
        {/* Mid input */}
        <div className="absolute" style={{ left: `${startX + 1.5 * scale}px`, top: `${startY + 1.5 * scale}px`, transform: "translate(-50%, -50%)" }}>
          <Input type="text" placeholder="Mid" value={formData.mid} onChange={(e) => handleInputChange("mid", e.target.value)} onKeyDown={handleKeyDown} className="w-20 h-8 text-xs text-center" />
        </div>
      </div>

      {/* Additional inputs */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-foreground mb-1">Pipe Drawer Label</label>
            <Input type="text" placeholder="e.g. R1C2" value={formData.drawerLabel} onChange={(e) => handleInputChange("drawerLabel", e.target.value)} onKeyDown={handleKeyDown} className="w-32 h-10 text-center" />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-foreground mb-1">Quantity</label>
            <Input type="number" placeholder="1" value={formData.quantity} onChange={(e) => handleInputChange("quantity", e.target.value)} onKeyDown={handleKeyDown} className="w-20 h-10 text-center" min="1" />
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-foreground mb-1">Slides Length</label>
            <Input type="text" placeholder='e.g. 20"' value={formData.slidesLength} onChange={(e) => handleInputChange("slidesLength", e.target.value)} onKeyDown={handleKeyDown} className="w-32 h-10 text-center" />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-foreground mb-1">Drawer Height</label>
            <Input type="text" placeholder='e.g. 6"' value={formData.drawerHeight} onChange={(e) => handleInputChange("drawerHeight", e.target.value)} onKeyDown={handleKeyDown} className="w-32 h-10 text-center" />
          </div>
        </div>
        <Button onClick={handleSubmit} className="mt-4 px-8 py-2">Enter</Button>
      </div>

      {/* Saved Entries */}
      {isLoading ? (
        <div className="w-full max-w-4xl text-center py-8">
          <p className="text-muted-foreground">Loading saved measurements...</p>
        </div>
      ) : entries.length > 0 && (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-foreground">Saved Measurements</h3>
            <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Diagrams
            </Button>
          </div>
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-border rounded-lg p-4 bg-card">
                <div className="relative mb-4">
                  <div className="absolute inset-x-0 top-0 flex justify-center">
                    <div className="text-lg font-bold text-foreground">{entry.drawer_label || "N/A"}</div>
                  </div>
                  <div className="flex justify-between items-center pt-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Qty:</span>
                      <Input
                        type="number"
                        value={entry.quantity}
                        onChange={(e) => onUpdateEntry(entry.id, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-16 h-8 text-center"
                        min="1"
                      />
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this measurement entry? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteEntry(entry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mb-4">{renderSmallDiagram(entry)}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <span className="font-medium text-muted-foreground">Slides Length:</span>
                    <div className="text-foreground font-semibold">{entry.slides_length ? `${entry.slides_length}"` : "N/A"}</div>
                  </div>
                  <div className="text-center">
                    <span className="font-medium text-muted-foreground">Drawer Height:</span>
                    <div className="text-foreground font-semibold">{entry.drawer_height ? `${entry.drawer_height}"` : "N/A"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipeDrawerDiagram;
