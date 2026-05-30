import { useCallback, useEffect, useMemo, useRef } from "react";
import { SelectionAdapter, SelectionItemMeta, useSelectionContext } from "./SelectionProvider";

/**
 * Item-side hook: makes a card selectable.
 *
 * Returns:
 * - selected: whether this item is currently in the selection set
 * - active: whether the surface is in select mode
 * - longPressHandlers: spread onto the card element to handle press-and-hold
 * - handleClick(originalOnClick): wraps a card's normal click; in select mode it toggles instead
 */
export function useSelectableItem(params: {
  surface: string;
  id: string;
  meta: SelectionItemMeta;
  enabled?: boolean;
  delay?: number;
}) {
  const { surface, id, meta, enabled = true, delay = 500 } = params;
  const { enter, toggle, isSelected, isSurfaceActive, registerItem } = useSelectionContext();

  const selected = isSelected(id) && isSurfaceActive(surface);
  const active = isSurfaceActive(surface);

  // Register/unregister item metadata
  const metaRef = useRef(meta);
  metaRef.current = meta;
  useEffect(() => {
    if (!enabled) return;
    return registerItem(surface, id, metaRef.current);
  }, [enabled, surface, id, registerItem]);

  // Long press
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const start = useCallback(() => {
    if (!enabled) return;
    triggeredRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      if (active) toggle(id);
      else enter(surface, id);
    }, delay);
  }, [enabled, active, delay, enter, surface, id, toggle]);

  const cancel = useCallback(() => clearTimer(), []);
  useEffect(() => () => clearTimer(), []);

  const longPressHandlers = useMemo(
    () => ({
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchMove: cancel,
      onTouchCancel: cancel,
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
    }),
    [start, cancel]
  );

  /**
   * Wrap a card's normal click handler. If select mode is active for our surface,
   * the click toggles the selection instead of running the normal action.
   * Returns a handler that should be assigned to the card's onClick.
   */
  const handleClick = useCallback(
    (originalOnClick?: (e: React.MouseEvent) => void) =>
      (e: React.MouseEvent) => {
        if (triggeredRef.current) {
          triggeredRef.current = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (active) {
          e.preventDefault();
          e.stopPropagation();
          toggle(id);
          return;
        }
        originalOnClick?.(e);
      },
    [active, id, toggle]
  );

  return { selected, active, longPressHandlers, handleClick };
}

/**
 * Surface-side hook: registers an adapter so the action bar knows what to do.
 */
export function useSelectionAdapter(adapter: SelectionAdapter | null) {
  const { registerAdapter } = useSelectionContext();
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;
  useEffect(() => {
    if (!adapter) return;
    return registerAdapter(adapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter?.surface, adapter?.canRename, adapter?.canMove, adapter?.canCopy, adapter?.canDelete, registerAdapter]);
}

export function useSelectionState() {
  return useSelectionContext();
}
