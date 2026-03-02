

# Resync Drive Files: Manual Button + Auto-Sync on Page Load

## Summary
Three changes: (1) the permanent cloud icon on synced cards now triggers a resync instead of opening Drive, (2) auto-resync all exported items when entering a submenu page, (3) ensure content edits trigger re-export reliably.

## Changes

### 1. Cloud Icon: Resync Instead of Open in Drive
**Files: `ToolCard.tsx`, `TextDisplayCard.tsx`, `FileDirectoryCard.tsx`**

- Change the permanent `CloudUpload` icon's `onClick` from calling `onOpenDrive()` to calling a new `onResync()` callback
- Change tooltip from "Open in Google Drive" to "Exported to Drive - Resync"
- While resyncing, show a spinning `Loader2` icon instead of the cloud icon
- The `MenuItemSection.tsx` will pass a resync handler instead of `openInDrive`

### 2. MenuItemSection: Wire Up Resync
**File: `MenuItemSection.tsx`**

- Update the `DriveExportContext` interface to include `syncToDriveIfNeeded`
- For each synced item, pass `onResync` that calls `driveExport.syncToDriveIfNeeded(type, id)` using the stored folder from the existing drive ref
- Remove `onOpenDrive` prop usage from all card components

### 3. useDriveExport: Add Batch Resync + Page-Load Sync
**File: `useDriveExport.tsx`**

- Add `syncAllForCategory(categoryId)` function: given a category ID, find all menu items in that category that have drive refs, and re-export each one sequentially (to avoid rate limits)
- Expose this function so `MenuItemsColumn` can call it on mount
- Make `syncToDriveIfNeeded` return a promise and show the spinner state via a new `isSyncing(id)` tracker (separate from `exportingIds`)

### 4. MenuItemsColumn: Trigger Auto-Sync on Page Load
**File: `MenuItemsColumn.tsx`**

- After `sections` data loads and `driveExport.driveRefs` are available, trigger a one-time background sync for all items in this category that have existing drive refs
- Use a `useEffect` with a ref guard to prevent repeated syncs
- This ensures whenever a user navigates to a submenu, all exported items get updated

### 5. ExportToDriveButton: No Change Needed
The export button (with folder picker) stays as-is for first-time exports. Only the permanent synced indicator changes behavior.

## Technical Details

### Resync flow
- When user clicks cloud icon or when auto-sync fires, call `syncToDriveIfNeeded(entityType, entityId)`
- This reuses the existing `drive_folder_id` from the drive ref, so no folder picker is needed
- The edge function already handles updating existing files via `existingDriveFileId`

### Auto-sync on page load
- In `MenuItemsColumn`, after sections load, collect all item IDs that have drive refs
- Call `syncToDriveIfNeeded` for each with a small delay between calls (sequential, not parallel) to avoid Google API rate limits
- Show no toast for auto-sync (silent background operation), only log to console

### Syncing state tracking
- Add a `syncingIds` Set (separate from `exportingIds`) to track which items are currently being resynced
- Expose `isSyncing(id)` so the cloud icon can show a spinner during resync
- Cards will check both `isExporting` and `isSyncing` to determine spinner state
