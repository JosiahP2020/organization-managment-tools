

# Fix Drive Export Bugs + Add Sync Badges, File Export Buttons, and Solid Hover Buttons

## Summary

This plan addresses 7 issues and feature requests:

1. **Folder list not loading on open** -- Add a refresh button to the folder picker dialog
2. **Clicking empty space opens document** -- Stop click propagation from the dialog/export button
3. **Export button click also opens document** -- Fix event propagation on the ExportToDriveButton
4. **Folder icon misaligned** -- Center the folder icon and "No subfolders" text vertically in the empty state
5. **Add sync badge to item cards** -- Show a small Drive icon indicator permanently on cards that have been exported
6. **Add export buttons to file directory files** -- Show an export-to-Drive button on each file card inside FileDirectoryView
7. **Make hover buttons solid on card hover** -- Change button styling so they have a solid background when the parent card is hovered (not just when the button itself is hovered)

---

## Technical Details

### 1. Refresh Button in DriveFolderPickerDialog

**File:** `src/components/menu/DriveFolderPickerDialog.tsx`

Add a `RefreshCw` icon button next to the breadcrumbs. Clicking it calls `fetchFolders(currentFolderId)` to reload the folder list.

### 2 & 3. Fix Click Propagation (ExportToDriveButton + DriveFolderPickerDialog)

**File:** `src/components/menu/ExportToDriveButton.tsx`

The button already calls `e.stopPropagation()`, but the `DriveFolderPickerDialog` is rendered inside the card's clickable area. When the dialog closes (via X or Cancel), the click event bubbles up to the card's `onClick` handler which navigates to the document.

**Fix:**
- Wrap the `DriveFolderPickerDialog` render with a `<div onClick={e => e.stopPropagation()}>` to prevent any dialog interaction from bubbling to the card.
- Also add `onPointerDownOutside` handler on DialogContent to stop propagation.

### 4. Center Folder Icon in Empty State

**File:** `src/components/menu/DriveFolderPickerDialog.tsx`

The empty state container uses `h-full` but the ScrollArea needs explicit height handling. Add `items-center justify-center` and ensure the parent div fills the scroll area height properly. The fix is to make the empty-state wrapper a flex column with full height centering.

### 5. Sync Badge on Item Cards

**Files:** `src/components/menu/ToolCard.tsx`, `src/components/menu/TextDisplayCard.tsx`, `src/components/menu/FileDirectoryCard.tsx`

Add a new optional `isSynced` prop (boolean). When true, show a small `CloudUpload` icon (from lucide) in `text-primary` right after the delete button (far right of the card). This icon is always visible (not hover-dependent), acting as a permanent indicator.

**File:** `src/components/menu/MenuItemSection.tsx`

Pass `isSynced={!!driveRef}` to each card component. For FileDirectoryCard, also pass the prop based on the drive ref lookup.

### 6. Export Buttons on File Directory Files

**File:** `src/components/menu/FileDirectoryView.tsx`

Accept new optional props: `driveExport` context (same shape as MenuItemSection's DriveExportContext). For each file card, show an `ExportToDriveButton` in the action buttons area (next to Download and Delete). The entity type will be `"file"` and the entity ID will be the file's ID.

**File:** `src/components/menu/FileDirectoryCard.tsx`

Pass `driveExport` through to `FileDirectoryView`.

**File:** `src/components/menu/MenuItemSection.tsx`

Pass the `driveExport` context to `FileDirectoryCard` so it can thread it to FileDirectoryView.

### 7. Solid Hover Buttons

**Files:** `src/components/menu/ToolCard.tsx`, `src/components/menu/TextDisplayCard.tsx`, `src/components/menu/FileDirectoryView.tsx`

Currently buttons use `variant="ghost"` which has a transparent background until directly hovered. Change the button classes so that when the parent card is hovered (`group-hover`), buttons get a solid background:

- Add `group-hover/card:bg-secondary` (or similar) to each action button's className so they appear solid when the card is hovered, not just when the individual button is hovered.
- Alternatively, wrap the button group in a container that gets `bg-secondary` on group hover and apply it uniformly.

The simplest approach: on each Button inside the hover controls, add `group-hover:bg-accent` so they look solid as soon as the card is hovered.

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/menu/DriveFolderPickerDialog.tsx` | Add refresh button; fix empty state centering |
| `src/components/menu/ExportToDriveButton.tsx` | Wrap dialog in stopPropagation div |
| `src/components/menu/ToolCard.tsx` | Add `isSynced` badge; solid hover buttons |
| `src/components/menu/TextDisplayCard.tsx` | Add `isSynced` badge; solid hover buttons |
| `src/components/menu/FileDirectoryCard.tsx` | Add `isSynced` badge; pass driveExport to FileDirectoryView |
| `src/components/menu/FileDirectoryView.tsx` | Add export buttons on individual file cards; solid hover buttons |
| `src/components/menu/MenuItemSection.tsx` | Pass `isSynced` and `driveExport` to FileDirectoryCard |

