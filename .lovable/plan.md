

# Lockbox Title, Address Links, Drive Resync, and Auto-Sync

## 4 Issues to Address

### 1. Lockbox Code Export Title
**Problem**: When exporting a lockbox code to Google Drive, the title is just the code (e.g., "1212"). It should be "Lockbox Code: 1212".

**Fix**: In the edge function (`google-drive-export/index.ts`), when resolving the title for `text_display` items, also fetch `description` (which stores the subtype: "text", "address", or "lockbox"). If `description === "lockbox"`, prefix the title with "Lockbox Code: ". If `description === "address"`, prefix with "Address: ".

### 2. Address Link Blocked in Preview
**Problem**: Clicking an address card shows "google.com is blocked / ERR_BLOCKED_BY_RESPONSE". This is because the card renders as an `<a>` tag, and the preview iframe's sandbox restrictions block cross-origin navigation.

**Fix**: Change the address card from an `<a>` tag to a `<div>` with an `onClick` handler that calls `window.open(mapsUrl, "_blank")`. This avoids the iframe navigation restriction and works in both the preview and production. For non-admin mode only (admin mode already suppresses the link).

### 3. Resync Drive References (Detect Deleted Files)
**Problem**: If a user deletes files from Google Drive, the app still shows them as "synced" with the cloud icon. Re-exporting then errors because the edge function tries to update a file that no longer exists.

**Fix**: Create a new edge function `google-drive-verify` that accepts a list of `drive_file_id` values, checks each one against Google Drive (HEAD request to see if it exists / is trashed), and returns which ones are still valid. Then call this on page load from `useDriveExport` to clean up stale references.

- New edge function: `supabase/functions/google-drive-verify/index.ts` -- accepts an array of drive file IDs, batch-checks them via Google Drive API, deletes invalid `drive_file_references` rows, returns the list of removed entity IDs.
- Update `useDriveExport.tsx` to call this verification after fetching `driveRefs`, pruning stale entries so the UI updates.

### 4. Auto-Sync: Update Drive When Content Changes
**Problem**: When a user edits a checklist or SOP that's already exported to Drive, the Drive copy becomes stale.

**Fix**: Add an auto-sync mechanism. After any mutation that modifies content (add/edit/delete items, sections, cells, images), if the entity has a `drive_file_reference`, automatically re-export to Drive in the background.

- Add a helper function `syncToDriveIfNeeded(entityType, entityId)` to `useDriveExport` that checks if a drive ref exists for that entity and, if so, silently re-exports using the stored folder ID.
- Call this function from the `onSuccess` callbacks of relevant mutations in the checklist editor, gemba doc editor, and text display edit handlers.
- Show a subtle toast like "Syncing to Drive..." with no error interruption (fail silently with a console warning).

## Technical Details

### Edge function title fix (google-drive-export/index.ts, ~line 615-617)
Change the `text_display` title resolution to also fetch `description`:
```typescript
const { data: menuItem } = await supabaseUser
  .from("menu_items")
  .select("name, description")
  .eq("id", rawId)
  .single();

const subType = menuItem?.description;
if (subType === "lockbox") {
  title = `Lockbox Code: ${menuItem?.name || ""}`;
} else if (subType === "address") {
  title = `Address: ${menuItem?.name || ""}`;
} else {
  title = menuItem?.name || "Text Item";
}
```

### Address card fix (TextDisplayCard.tsx, ~line 63-71)
Replace the `<a>` wrapper with a `<div>` that uses `onClick={() => window.open(mapsUrl, "_blank")}` for address items.

### New edge function: google-drive-verify/index.ts
- Accepts `{ driveFileIds: string[] }` in the request body
- Authenticates user, gets org integration token
- For each drive file ID, calls `GET https://www.googleapis.com/drive/v3/files/{id}?fields=id,trashed`
- Returns `{ invalidIds: string[] }` for files that are 404 or trashed
- Deletes corresponding `drive_file_references` rows

### useDriveExport.tsx changes
- After `driveRefs` query succeeds and has results, trigger a background verification call
- Add `syncToDriveIfNeeded(entityType, entityId)` function that checks for existing ref and re-exports if found
- Expose `syncToDriveIfNeeded` so editor components can call it after mutations

### Editor integration
- In `ChecklistEditor` page: after item/section mutations succeed, call `syncToDriveIfNeeded("checklist", checklistId)`
- In `GembaDocEditor` page: after cell/page mutations succeed, call `syncToDriveIfNeeded("gemba_doc", gembaDocId)`
- In `MenuItemSection`/`TextDisplayCard`: after title edit, call `syncToDriveIfNeeded("text_display", itemId)`

