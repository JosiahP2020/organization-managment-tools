import { useMemo, useRef, useEffect } from "react";
import { useSelectionAdapter } from "@/components/selection";
import type { SelectionAdapter } from "@/components/selection";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Selection adapter for a widget container (column, sidebar, grid).
 * Widgets live in local state, so the adapter just delegates delete back
 * to a caller-provided callback. Each container passes a unique surface.
 */
export function useWidgetSelectionAdapter(
  surface: string,
  onDeleteIds: (ids: string[]) => void
) {
  const { isAdmin } = useAuth();
  const onDeleteRef = useRef(onDeleteIds);
  useEffect(() => {
    onDeleteRef.current = onDeleteIds;
  }, [onDeleteIds]);

  const adapter = useMemo<SelectionAdapter | null>(() => {
    if (!isAdmin) return null;
    return {
      surface,
      surfaceLabel: "Widgets",
      canRename: false,
      canMove: false,
      canCopy: false,
      canDelete: true,
      delete: (ids) => onDeleteRef.current(ids),
    };
  }, [isAdmin, surface]);

  useSelectionAdapter(adapter);
  return surface;
}
