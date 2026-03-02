

# Restore PDF Export for Printable Documents, Keep Google Docs for Text Items

## Summary
Revert the export to a hybrid approach:
- **Checklists, SOPs, Follow-up Lists** (printable documents) -> Export as **PDFs** to Google Drive, matching the existing print layout
- **Text Display items** (address, lockbox, text) -> Keep as **Google Docs** with the "Open in App" link
- **App-to-Drive links** -> Keep the clickable cloud icon that opens the file in Drive

## Changes

### 1. Edge Function: Rebuild PDF export for printable documents
**File: `supabase/functions/google-drive-export/index.ts`**

For `checklist` and `gemba_doc` types, the function will:
1. Fetch the full document data (sections, items, pages, cells, organization logo)
2. Build HTML matching the print layout (inline styles -- required since Google Docs strips CSS classes)
3. Upload HTML as a temporary Google Doc (Google converts it)
4. Export the Google Doc as PDF via the Drive export API
5. Upload the PDF binary as a file to the target folder
6. Delete the temporary Google Doc
7. Store the PDF file ID in `drive_file_references`

For `text_display` type, keep the current Google Doc with "Open in App" link (no change).

For `file_directory_file` type, keep current behavior.

### 2. Fix Drive links for PDFs vs Docs
**File: `src/hooks/useDriveExport.tsx`**

The `openInDrive` function currently always opens `docs.google.com/document/d/{id}/edit`. For PDF files, it should open `drive.google.com/file/d/{id}/view` instead. Store a `file_type` indicator (either in the edge function response or by checking the entity type) to determine which URL pattern to use.

Simple approach: use `drive.google.com/file/d/{id}/view` for all types -- this works for both PDFs and Google Docs in Drive's viewer.

### 3. HTML templates for print layouts

**Checklist PDF HTML**: Mirror `ChecklistPrintView.tsx` with inline styles:
- Header with org logo (left) and centered title
- Sections with left-accent border and gray background
- Checkbox squares (20x20px, 2px border) or numbered items based on `display_mode`
- Nested child items with indentation

**SOP/Gemba Doc PDF HTML**: Mirror `GembaDocPrintView.tsx` with inline styles:
- Landscape orientation
- Header with logo (left), title (center), page number (right, orange badge)
- Grid of cells with images, step number badges (orange), and step text below
- Multiple pages

### 4. Data fetching in edge function

For checklists, the function needs to fetch:
- `checklists` (title, description, display_mode)
- `checklist_sections` (title, display_mode, image_url, sort_order)
- `checklist_items` (text, parent_item_id, sort_order, item_type)
- `organizations` (main_logo_url, accent_color)

For gemba_docs, the function needs to fetch:
- `gemba_docs` (title, description, grid_columns, grid_rows, orientation)
- `gemba_doc_pages` (page_number)
- `gemba_doc_cells` (position, image_url, step_number, step_text)
- `organizations` (main_logo_url, accent_color)

## Technical Notes

- The "create temp doc -> export PDF -> upload PDF -> delete temp doc" flow requires 4 API calls to Google but produces a real PDF that renders correctly in Drive's viewer
- All HTML uses inline styles (no `<style>` blocks) since Google's HTML-to-Doc converter strips them
- The existing token refresh, folder management, and `DRIVE_TOKEN_EXPIRED` error handling remain unchanged
- The `drive_file_references` table stores the final PDF file ID, not the temp doc ID
