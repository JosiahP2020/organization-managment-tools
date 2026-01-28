import { LucideIcon, icons } from "lucide-react";
import { cn } from "@/lib/utils";

// Curated list of icons for menu/navigation use
export const AVAILABLE_ICONS = [
  "folder", "file", "file-text", "files", "folder-open",
  "wrench", "settings", "cog", "sliders-horizontal",
  "clipboard-list", "clipboard-check", "clipboard", "list-checks",
  "grid-2x2", "grid-3x3", "layout-grid", "layout-dashboard",
  "ruler", "gauge", "activity", "trending-up",
  "users", "user", "user-check", "user-plus",
  "home", "building", "building-2", "factory",
  "hammer", "tool", "wrench", "screwdriver",
  "bar-chart", "bar-chart-2", "pie-chart", "line-chart",
  "list", "list-ordered", "check-square", "square",
  "search", "plus", "plus-circle", "edit", "pencil",
  "trash", "trash-2", "archive", "archive-restore",
  "pin", "star", "heart", "bookmark", "flag",
  "calendar", "clock", "timer", "alarm-clock",
  "alert-triangle", "alert-circle", "info", "help-circle",
  "check-circle", "check", "x-circle", "x",
  "chevron-right", "chevron-down", "chevron-up", "chevron-left",
  "menu", "more-horizontal", "more-vertical",
  "eye", "eye-off", "lock", "unlock",
  "download", "upload", "external-link", "link",
  "image", "video", "music", "file-audio",
  "book", "book-open", "graduation-cap", "award",
  "briefcase", "package", "box", "truck",
  "map-pin", "navigation", "compass", "globe",
  "phone", "mail", "message-circle", "send",
  "bell", "bell-ring", "volume-2", "speaker",
  "zap", "bolt", "power", "battery",
  "sun", "moon", "cloud", "umbrella",
  "shield", "shield-check", "key", "fingerprint",
] as const;

export type IconName = typeof AVAILABLE_ICONS[number];

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function DynamicIcon({ 
  name, 
  className, 
  size = 24, 
  strokeWidth = 2 
}: DynamicIconProps) {
  // Convert kebab-case to PascalCase for lucide-react
  const pascalName = name
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const IconComponent = icons[pascalName as keyof typeof icons] as LucideIcon | undefined;

  if (!IconComponent) {
    // Fallback to a default icon if not found
    const FallbackIcon = icons.File as LucideIcon;
    return (
      <FallbackIcon 
        className={cn("text-muted-foreground", className)} 
        size={size} 
        strokeWidth={strokeWidth} 
      />
    );
  }

  return (
    <IconComponent 
      className={className} 
      size={size} 
      strokeWidth={strokeWidth} 
    />
  );
}

// Helper to check if an icon name is valid
export function isValidIconName(name: string): boolean {
  const pascalName = name
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return pascalName in icons;
}
