import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface SelectionItemMeta {
  /** Display label used in confirmation dialogs */
  label: string;
  /** Per-item type discriminator the adapter can read */
  type?: string;
  /** Optional grouping id (e.g. section id) */
  parentId?: string | null;
  /** Arbitrary payload the adapter may need (e.g. tool_type) */
  payload?: any;
}

export interface MoveTarget {
  id: string;
  label: string;
  group?: string;
}

export interface SelectionAdapter {
  /** Stable surface identifier, e.g. "menu:<categoryId>" */
  surface: string;
  /** Human label for the surface, used in the action bar */
  surfaceLabel?: string;
  canRename: boolean;
  canMove: boolean;
  canCopy: boolean;
  canDelete: boolean;
  rename?: (id: string, newName: string) => Promise<void> | void;
  delete: (ids: string[]) => Promise<void> | void;
  move?: (ids: string[], target: MoveTarget) => Promise<void> | void;
  copy?: (ids: string[], target: MoveTarget) => Promise<void> | void;
  listMoveTargets?: () => Promise<MoveTarget[]> | MoveTarget[];
}

interface SelectionContextValue {
  surface: string | null;
  selectedIds: ReadonlySet<string>;
  isActive: boolean;
  items: ReadonlyMap<string, SelectionItemMeta>;
  adapter: SelectionAdapter | null;
  enter: (surface: string, id: string) => void;
  toggle: (id: string) => void;
  exit: () => void;
  registerItem: (surface: string, id: string, meta: SelectionItemMeta) => () => void;
  registerAdapter: (adapter: SelectionAdapter) => () => void;
  isSelected: (id: string) => boolean;
  isSurfaceActive: (surface: string) => boolean;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [surface, setSurface] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const itemsRef = useRef<Map<string, Map<string, SelectionItemMeta>>>(new Map());
  const [, setVersion] = useState(0);
  const adaptersRef = useRef<Map<string, SelectionAdapter>>(new Map());

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const exit = useCallback(() => {
    setSurface(null);
    setSelectedIds(new Set());
  }, []);

  const enter = useCallback((s: string, id: string) => {
    setSurface(s);
    setSelectedIds(new Set([id]));
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) {
        // exit when nothing is selected
        setSurface(null);
      }
      return next;
    });
  }, []);

  const registerItem = useCallback(
    (s: string, id: string, meta: SelectionItemMeta) => {
      if (!itemsRef.current.has(s)) itemsRef.current.set(s, new Map());
      itemsRef.current.get(s)!.set(id, meta);
      return () => {
        itemsRef.current.get(s)?.delete(id);
      };
    },
    []
  );

  const registerAdapter = useCallback(
    (adapter: SelectionAdapter) => {
      adaptersRef.current.set(adapter.surface, adapter);
      bump();
      return () => {
        adaptersRef.current.delete(adapter.surface);
        bump();
      };
    },
    [bump]
  );

  // Escape exits select mode
  useEffect(() => {
    if (!surface) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [surface, exit]);

  const value = useMemo<SelectionContextValue>(() => {
    const activeItems = (surface ? itemsRef.current.get(surface) : null) ?? new Map();
    const adapter = surface ? adaptersRef.current.get(surface) ?? null : null;
    return {
      surface,
      selectedIds,
      isActive: !!surface,
      items: activeItems,
      adapter,
      enter,
      toggle,
      exit,
      registerItem,
      registerAdapter,
      isSelected: (id: string) => selectedIds.has(id),
      isSurfaceActive: (s: string) => surface === s,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, selectedIds, enter, toggle, exit, registerItem, registerAdapter]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelectionContext() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used inside <SelectionProvider>");
  return ctx;
}
