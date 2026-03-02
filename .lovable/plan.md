

# Graceful Google Drive Reconnection Handling

## Problem
When a Google OAuth refresh token expires or gets revoked (which **will** happen in production), users see a cryptic error like "Token refresh failed: invalid_grant". There's no clear guidance telling them what happened or how to fix it.

## Solution
Add a specific error code for token failures across all Drive edge functions, then detect that code on the client side and show a friendly dialog prompting the user to reconnect Google Drive.

## Changes

### 1. Edge Functions: Return a specific error code on token failure
Update both `google-drive-export` and `google-drive-list-folders` edge functions so that when `refreshAccessToken` throws an `invalid_grant` error, the function:
- Sets the integration status to `"disconnected"` in the database (so the app reflects reality)
- Returns a JSON response with a recognizable error code like `"DRIVE_TOKEN_EXPIRED"`

This way the client can distinguish "token expired" from other errors.

### 2. Client: Detect the error and show a reconnect dialog
Update `useDriveExport.tsx` so that when an export call returns `DRIVE_TOKEN_EXPIRED`:
- Instead of a plain error toast, show a toast with a clear message: **"Google Drive disconnected. Please reconnect in Organization Settings."**
- Invalidate the `drive-connected` query so the UI immediately reflects the disconnected state

### 3. Folder Picker: Same handling
Update `DriveFolderPickerDialog` (or wherever the list-folders call is made) to also detect `DRIVE_TOKEN_EXPIRED` and show the same friendly message instead of a raw error.

### 4. Export button: Pre-check connection
The `ExportToDriveButton` already relies on `isConnected` from `useDriveExport`. Once the edge function marks the integration as disconnected and the query is invalidated, the export buttons will naturally reflect the disconnected state on next render.

## Technical Details

**Edge function changes** (both `google-drive-export/index.ts` and `google-drive-list-folders/index.ts`):
- Wrap the `refreshAccessToken` call in a try/catch
- On `invalid_grant`, update `organization_integrations` to set `status = 'disconnected'`
- Return `{ error: "...", code: "DRIVE_TOKEN_EXPIRED" }` with status 400

**Client changes** (`useDriveExport.tsx`):
- Check `data?.code === "DRIVE_TOKEN_EXPIRED"` in the export handler
- Show a descriptive toast with an action or message pointing to Organization Settings
- Invalidate `drive-connected` query

**Folder picker changes** (`DriveFolderPickerDialog.tsx`):
- Same pattern: detect `DRIVE_TOKEN_EXPIRED` from the list-folders response and show the reconnect message instead of opening the picker

## What Users Will See
When their Google Drive token expires and they try to export:
1. A clear toast message: "Google Drive has been disconnected. Please reconnect it in Organization Settings."
2. The export/sync icons will update to reflect the disconnected state
3. They can go to Organization Settings and click "Connect Google Drive" to re-authorize
