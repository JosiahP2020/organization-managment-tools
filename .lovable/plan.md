# Multi-Select System

Replace the current long-press → inline edit/delete menu with an app-style multi-select: long-press selects one item and reveals a top action bar; subsequent taps add/remove items; the bar offers Rename (single only), Delete, Move, Copy.

## How it will feel

1. Long-press any item → enters select mode, that item is selected, a top action bar slides in.
2. Tap other eligible items in the same surface to add/remove from selection.
3. Top bar shows: count, ✕ exit, Rename (only when 1 selected), Copy, Move, Delete.
4. Tap "✕" or press Escape (desktop) to exit select mode.
5. While in select mode, normal tap-to-open/navigate is disabled — taps only toggle selection.

## Surfaces in scope

- Menu items inside `MenuDetail` (tools, file directories, text/address/lockbox, submenus)
- Menu sections themselves
- Dashboard category cards and dashboard widgets
- Checklist items and checklist sections
- Files inside a File Directory
- Projects in `ShopInstall`

## Architecture

A single shared system, so every surface plugs in the same way.

```text
src/components/selection/
  SelectionProvider.tsx     ← Context: mode on/off, selected ids, surface id, item registry
  useSelection.ts           ← Hook for items + surfaces to read/toggle selection
  SelectionActionBar.tsx    ← Fixed top bar (replaces nothing; renders only when active)
  selectionAdapters.ts      ← Per-surface adapter type + registry
```

**SelectionProvider** holds:
- `surface: string | null` (e.g. `"menu:<categoryId>"`, `"files:<menuItemId>"`)
- `selectedIds: Set<string>`
- `items: Map<id, { type, label, parentId }>` (registered by visible cards)
- actions: `enter(surface, id)`, `toggle(id)`, `exit()`

Only one surface can be active at a time. Navigating to a different surface (route change or opening a different file directory) auto-exits.

**Adapter contract** (one per surface):
```ts
interface SelectionAdapter {
  type: "menu-item" | "menu-section" | "dashboard-card" | "widget"
       | "checklist-item" | "checklist-section" | "file" | "project";
  canRename: boolean;
  canMove: boolean;
  canCopy: boolean;
  rename(id: string, newName: string): Promise<void>;
  delete(ids: string[]): Promise<void>;
  move?(ids: string[], target: MoveTarget): Promise<void>;
  copy?(ids: string[], target: MoveTarget): Promise<void>;
  listMoveTargets?(): Promise<MoveTarget[]>; // for picker dialog
}
```

The action bar reads the active adapter from a registry and enables/disables buttons accordingly.

## Card changes

Every card component (`MenuItemCard`, `FileDirectoryCard`, `ToolCard`, `TextDisplayCard`, `SubmenuCard`, `MenuSectionHeader`, `ChecklistItemRow`, `CategoryCard*`, `WidgetRenderer` wrappers, `FileCard`, `ProjectCard`) gets:
- `useSelection()` hook
- Long-press → `enter(surface, id)`
- Tap → if in select mode for this surface, `toggle(id)`; else original behavior
- Visual selected state: ring + checkmark badge top-left
- Existing per-card inline edit/delete buttons + long-press action menu **removed**

Renaming an item happens via a small inline-edit dialog launched from the action bar's Rename button (only enabled when exactly one item selected).

## Move / Copy picker

Single shared `MoveCopyDialog` that asks the adapter for available targets and renders a searchable list grouped by parent. Move/Copy actions then call the adapter, which does the DB writes.

Backend work needed:
- Menu items: add a server function `copy_menu_items(ids, target_category_id)` that duplicates rows (and their children for submenus/sections); move is an UPDATE of `category_id` + `sort_order`.
- Files: copy duplicates the storage object + DB row; move updates `menu_item_id`.
- Checklist items: copy/move within and across sections of the same list (cross-list move out of scope for v1).
- Dashboard widgets/cards: move across orgs is N/A; only reorder/delete/copy within the dashboard. Move target picker is hidden for these.
- Projects: delete + copy only; no move target (single list).

All bulk deletes go through one `DeleteConfirmDialog` showing the count and item names (truncated).

## Rollout in this PR

Because the surface count is large, the PR will land all of it but in layers so review is tractable:

1. Build `SelectionProvider`, `useSelection`, `SelectionActionBar`, `MoveCopyDialog`, `selectionAdapters` registry, and mount the bar inside `DashboardLayout`.
2. Convert menu items + menu sections (`MenuDetail` surface) and remove the old per-card long-press popover and per-card inline edit/delete buttons.
3. Convert file directory files.
4. Convert dashboard cards + widgets.
5. Convert checklist items + sections.
6. Convert projects.
7. Add Postgres `copy_*` functions via a migration.

## Things being removed

- Per-card long-press popover that exposed Edit/Delete inline.
- The hover-revealed Move-up/Move-down/Edit/Trash icon strip on cards (reorder arrows stay — they're on the right and don't conflict).
- Sessionstorage-based "just created → auto-expand" plumbing where it conflicts with the new selection tap behavior (file directory auto-expand is already handled by always-expanded default).

## Risks / open questions

- Long-press currently competes with reorder buttons on some cards. The new pattern collapses that: reorder arrows hide while in select mode (you can't sort and select at once).
- Drive-synced files: copy will not copy the Drive export ref; the duplicate behaves as un-synced.
- Cross-organization move is not supported.

## Confirm before I start

I will create a Postgres migration for `copy_menu_items` and `copy_files`. Approving this plan also approves that migration being proposed for review when we get there.
