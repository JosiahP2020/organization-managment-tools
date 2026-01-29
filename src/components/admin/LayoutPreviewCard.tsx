import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface LayoutPreviewCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function LayoutPreviewCard({ title, description, selected, onClick, children }: LayoutPreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left w-full",
        "hover:border-primary/50 hover:bg-accent/30",
        selected 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
          : "border-border bg-card"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      
      {/* Preview Box */}
      <div className="w-full aspect-[16/10] bg-muted/50 rounded-lg border border-border/50 mb-3 p-2 overflow-hidden">
        {children}
      </div>
      
      <h3 className="font-medium text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </button>
  );
}

// Mini preview components for each layout type
export function FullWidthPreview() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5">
      {/* Header bar */}
      <div className="h-2 bg-muted-foreground/20 rounded-sm w-full" />
      {/* Full width cards */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-3 bg-primary/30 rounded-sm w-full" />
        <div className="h-3 bg-primary/20 rounded-sm w-full" />
        <div className="h-3 bg-primary/15 rounded-sm w-full" />
      </div>
    </div>
  );
}

export function GridRightColumnPreview() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5">
      {/* Header bar */}
      <div className="h-2 bg-muted-foreground/20 rounded-sm w-full" />
      {/* Grid + right column */}
      <div className="flex-1 flex gap-1">
        {/* Main grid */}
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-primary/30 rounded-sm" />
          <div className="bg-primary/20 rounded-sm" />
          <div className="bg-primary/15 rounded-sm" />
          <div className="bg-primary/10 rounded-sm" />
        </div>
        {/* Right column */}
        <div className="w-1/4 flex flex-col gap-1">
          <div className="flex-1 bg-muted-foreground/15 rounded-sm" />
          <div className="flex-1 bg-muted-foreground/10 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function SidebarLeftPreview() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5">
      {/* Header bar */}
      <div className="h-2 bg-muted-foreground/20 rounded-sm w-full" />
      {/* Sidebar + content */}
      <div className="flex-1 flex gap-1">
        {/* Left sidebar */}
        <div className="w-1/4 flex flex-col gap-0.5">
          <div className="h-2 bg-muted-foreground/20 rounded-sm" />
          <div className="h-2 bg-muted-foreground/15 rounded-sm" />
          <div className="h-2 bg-muted-foreground/10 rounded-sm" />
        </div>
        {/* Main content */}
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-primary/30 rounded-sm" />
          <div className="bg-primary/20 rounded-sm" />
          <div className="bg-primary/15 rounded-sm" />
          <div className="bg-primary/10 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function MasonryPreview() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5">
      {/* Header bar */}
      <div className="h-2 bg-muted-foreground/20 rounded-sm w-full" />
      {/* Masonry grid - varied heights */}
      <div className="flex-1 flex gap-1">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-4 bg-primary/30 rounded-sm" />
          <div className="h-2 bg-primary/15 rounded-sm" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-primary/20 rounded-sm" />
          <div className="h-4 bg-primary/10 rounded-sm" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-3 bg-primary/25 rounded-sm" />
          <div className="h-3 bg-primary/12 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// Card style previews
export function LeftAccentCardPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full h-full bg-card rounded border border-border flex overflow-hidden">
        <div className="w-1 bg-primary" />
        <div className="flex-1 p-1.5 flex flex-col justify-center gap-1">
          <div className="h-1.5 w-8 bg-muted-foreground/30 rounded-sm" />
          <div className="h-1 w-12 bg-muted-foreground/15 rounded-sm" />
        </div>
        <div className="w-4 h-4 m-1.5 bg-muted-foreground/20 rounded-sm" />
      </div>
    </div>
  );
}

export function StatCardPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full h-full bg-card rounded border border-border flex flex-col items-center justify-center gap-1 p-2">
        <div className="w-4 h-4 bg-primary/30 rounded-sm" />
        <div className="h-1.5 w-10 bg-muted-foreground/30 rounded-sm" />
        <div className="h-1 w-6 bg-muted-foreground/15 rounded-sm" />
      </div>
    </div>
  );
}

export function CleanMinimalCardPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full h-full bg-card rounded border border-border flex items-center gap-2 p-2">
        <div className="w-5 h-5 bg-muted-foreground/15 rounded-sm flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 w-12 bg-muted-foreground/30 rounded-sm" />
          <div className="h-1 w-16 bg-muted-foreground/15 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
