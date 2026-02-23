
# Phase 2: Google Drive Export (App → Drive)

## Overview
Allow admins to manually export app content to the connected Google Drive account. Content is saved to an `_app_storage` folder on Drive. Future: add auto-sync toggle in org settings.

## Steps

### Step 1: Create `google-drive-export` Edge Function
- Accepts: `{ type, id, organizationId }` where type is "checklist", "gemba_doc", "file_directory", or "text_display"
- Retrieves the org's Google Drive tokens from `organization_integrations`
- Refreshes the access token if expired (using refresh_token + Google token endpoint)
- Creates `_app_storage` root folder on Drive if it doesn't exist (stores folder ID in `organization_integrations.root_folder_id`)
- Creates sub-folders by type (e.g., `_app_storage/Checklists/`, `_app_storage/SOPs/`)
- For document types (checklists, SOPs): creates a Google Doc with the content
- For file directory items: uploads the actual files from Supabase storage
- For text display items: creates a Google Doc with the text content
- Updates in-place if the file already exists (tracked via a new `drive_file_references` table)

### Step 2: Create `drive_file_references` Table
- Columns: `id`, `organization_id`, `entity_type`, `entity_id`, `drive_file_id`, `drive_folder_id`, `last_synced_at`, `created_at`
- Tracks which app items have been exported to Drive and their Drive file IDs
- Enables in-place updates instead of creating duplicates

### Step 3: Add Export UI
- Add "Export to Drive" button on menu item cards (checklists, SOPs, file directories, text displays)
- Show a Drive badge (↑) on items that have been exported
- Add a "Sync All to Drive" button on the menu detail page header
- Show sync status (last synced timestamp) on exported items
- Toast notifications for success/failure

### Step 4: Add Auto-Sync Toggle (Future)
- Add toggle in Organization Settings under Google Drive section
- When enabled, automatically export on content create/update
- Store setting in `organizations` table (new `auto_sync_drive` column)

## Implementation Order
1. Step 2 (database table) — need this first
2. Step 1 (edge function) — core logic
3. Step 3 (UI) — wire it all together
4. Step 4 (auto-sync) — future enhancement
