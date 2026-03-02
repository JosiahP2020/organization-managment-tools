
# Google Drive Integration — Bidirectional Links

## Current Implementation (Completed)

### Export (App → Drive)
- Creates a **Google Doc** in the user's chosen Drive folder containing a clickable link back to the app
- No more PDFs or HTML rendering — just a simple link document
- Supports all entity types: checklists, SOP guides, follow-up lists, text items, file directory files
- Existing file detection: if a previously exported file was deleted from Drive, a fresh one is created

### Drive → App (via link)
- The Google Doc in Drive contains an "Open in App" hyperlink
- Clicking it navigates to the app page where the item lives

### App → Drive (via synced icon)
- The CloudUpload icon on synced cards is now **clickable**
- Clicking it opens the corresponding Google Doc in Drive in a new tab
- URL format: `https://docs.google.com/document/d/{drive_file_id}/edit`

### Drive File References
- `drive_file_references` table tracks the mapping between app entities and Drive files
- `drive_file_id` is used to construct the Drive URL on the client side

## Future Considerations
- Import from Drive: Pick a Drive file and add it as a link in the app
- Auto-sync when content changes
- Stale reference cleanup when files are deleted from Drive
