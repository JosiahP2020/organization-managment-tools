

# Export to Drive with Folder Picker

## Overview

When an admin clicks the Export to Drive button on a menu item card, instead of silently exporting to a fixed `_app_storage` folder, a **folder picker dialog** will open showing the user's Google Drive folder structure. The user selects the destination folder, confirms, and the file is exported there.

## How It Works

1. Admin clicks the Export to Drive button on a card (tool, text display, or file directory).
2. A **Drive Folder Picker dialog** opens, showing the user's Google Drive folders in a tree/breadcrumb navigation.
3. The user browses into subfolders and clicks "Export Here" to confirm.
4. The file is exported as a PDF (for checklists/SOPs) or as a file to the chosen folder.
5. The `drive_file_references` table records the chosen folder ID so future re-exports update in place.

## Technical Details

### 1. New Edge Function: `google-drive-list-folders`

A new backend function that lists folders in a given Google Drive parent folder. It:
- Authenticates the user and refreshes the Google OAuth token (same pattern as `google-drive-export`).
- Accepts an optional `parentId` parameter (defaults to `"root"` for top-level).
- Calls the Drive API: `GET /drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and '{parentId}' in parents and trashed=false`.
- Returns an array of `{ id, name }` folder objects.

### 2. New Component: `DriveFolderPickerDialog`

A modal dialog with:
- **Breadcrumb navigation** at the top (e.g., "My Drive > Projects > SOPs") so users can go back to parent folders.
- **Folder list** showing subfolders of the current location, each clickable to navigate deeper.
- **"Create Folder" button** to create a new folder inside the current location (calls the existing folder creation logic in the edge function).
- **"Export Here" button** to confirm the current folder as the destination.
- Loading and empty states.

### 3. Updated Export Flow

- The `useDriveExport` hook's `exportToDrive` function will accept an optional `folderId` parameter.
- The `google-drive-export` edge function will accept an optional `folderId` in the request body. When provided, it skips the automatic `_app_storage` subfolder creation and places the file directly in the specified folder.
- If `folderId` is not provided (backward compatibility), it falls back to the current `_app_storage` behavior.

### 4. PDF Export (from approved plan)

Checklists and SOPs will be exported as PDFs instead of Google Docs:
- Create a temporary Google Doc from HTML content.
- Export it as PDF via the Drive API.
- Upload the PDF to the chosen folder.
- Delete the temporary Google Doc.

### 5. UI Button Placement (from approved plan)

- Remove Export to Drive buttons from `ChecklistSidebar` and `GembaDocSidebar`.
- Show export buttons on `ToolCard`, `TextDisplayCard`, and `FileDirectoryCard` alongside edit/move/delete controls.
- Add "Import from Drive" option to the `AddMenuItemButton` dropdown (placeholder for now).

### 6. Drive export for tool items

Currently only `text_display` items get the drive button in `MenuItemSection`. This will be extended so `tool` items also show the button. The entity type mapping:
- `tool_type === "checklist"` or `"follow_up_list"` maps to entity type `"checklist"`
- `tool_type === "sop_guide"` maps to entity type `"gemba_doc"`

For single-use tools, the document ID comes from the `menu_item_documents` join table. This will require a query to look up linked documents when rendering the menu.

## Files to Create/Change

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/google-drive-list-folders/index.ts` | Create | New edge function to list Drive folders |
| `src/components/menu/DriveFolderPickerDialog.tsx` | Create | Folder browser dialog with breadcrumbs |
| `supabase/functions/google-drive-export/index.ts` | Modify | Accept optional `folderId`, add PDF export logic |
| `src/hooks/useDriveExport.tsx` | Modify | Accept `folderId`, open picker dialog flow |
| `src/components/menu/ExportToDriveButton.tsx` | Modify | Trigger folder picker instead of direct export |
| `src/components/menu/MenuItemSection.tsx` | Modify | Show drive button on tool items, map tool types |
| `src/components/menu/ToolCard.tsx` | No change | Already accepts `driveButton` prop |
| `src/components/menu/FileDirectoryCard.tsx` | Modify | Add `driveButton` prop |
| `src/components/menu/AddMenuItemButton.tsx` | Modify | Add "Import from Drive" placeholder option |
| `src/components/training/ChecklistSidebar.tsx` | Modify | Remove export button |
| `src/components/training/GembaDocSidebar.tsx` | Modify | Remove export button |
| `src/pages/training/ChecklistEditor.tsx` | Modify | Remove drive export props |
| `src/pages/training/GembaDocEditor.tsx` | Modify | Remove drive export props |
| `supabase/config.toml` | Modify | Register new `google-drive-list-folders` function |

