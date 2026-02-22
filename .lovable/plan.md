## Google Drive Integration — Full Plan

### Phase 1: OAuth + Connect Drive
- Add "Google Drive" section in Organization Settings with connect/disconnect button
- Edge function for Google OAuth flow (consent, token exchange, refresh)
- `organization_integrations` table (already exists) to store encrypted tokens
- Admin connects org-level Google account, optionally selects a root folder

### Phase 2: Import from Drive (↓ Badge)

**Step 1 — "Drive" item type in AddMenuItemButton**
- New dropdown option with Drive icon
- Opens Google Drive file/folder picker (via Drive Picker API)
- Admin can select individual files or entire folders

**Step 2 — Smart type detection with user confirmation**
- Auto-detect rules:
  - Google Docs with "Follow-up list" or "Deficiency list" in title → Follow-up List card
  - Folder of PDFs or scattered PDFs (appliance specs pattern) → File Directory
  - Single PDF (drawings/blueprints) → Individual card
  - JPG/JPEG images (job site pictures) → File Directory
  - Google Docs with short content (address, lockbox code) → Text Display card
  - Other → Individual card
- **Always ask user to confirm** detected type before importing
- **Step 3 — Visual format preview during type selection**: Show a small popup/preview card of each format style (Follow-up List card, File Directory, Text Display, etc.) so the admin can see what each looks like before choosing

**Step 4 — Sync on page load**
- When a menu section with a linked Drive folder is opened, check Drive for changes
- New files appear, removed files disappear, updated files refresh
- Drive import badge (↓) shown on all imported items

### Phase 3: Export to Drive (↑ Badge)

**Step 1 — Link menu/items to a Drive folder for export**
- Admin can choose to export entire menu contents or select individual items
- Triggers Drive folder picker to choose destination

**Step 2 — Export behavior by type**
- Checklists, SOPs, Follow-up Lists → exported as PDFs to Drive
- Addresses, Lockbox codes → exported as shortcut links pointing back to the app
- Drive export badge (↑) shown on all exported items

**Step 3 — Sync updates**
- When an app item changes (checklist edited, SOP updated, etc.), the corresponding Drive file is **replaced in-place** (same file ID, not a duplicate)
- Updates happen on page load (same pattern as import sync)
- **Critical: Always replace the old copy, never create duplicates** — whether it's a PDF, image, document, or any other file type

### Phase 4: Media Storage on Drive

**Step 1 — Redirect app uploads to Drive**
- Images, videos, PDFs uploaded within the app (SOP images, training docs, etc.) stored in a dedicated `_app_storage` folder on Google Drive
- App references them via Drive URLs instead of Supabase storage
- Significantly reduces storage costs

**Step 2 — Transparent to users**
- Upload UX stays the same — user picks a file, it goes to Drive behind the scenes
- Loading/display uses Drive URLs seamlessly

### UI Details
- **Import badge**: Drive icon with down arrow (↓)
- **Export badge**: Drive icon with up arrow (↑)
- Both badges appear on the card/item they apply to

### Build Order
Phase 1 → Phase 2 → Phase 3 → Phase 4 (sequential, each phase validated before next)

---

## Previous: Update TextDisplayCard Layout

### What Changes
Currently, Address and Lock Box Code items display as a single line like "Address: 123 Main St" or "Lock Box Code: 1234". Instead, the label ("Address" or "Lock Box Code") should appear as a small, grey subtitle below the main text -- matching the Follow-up List tool card style shown in the screenshot.

### Visual Result
- **Text items**: No subtitle, just the text (unchanged)
- **Address items**: Main text on top, "Address" in small grey text below
- **Lock Box Code items**: Main text on top, "Lock Box Code" in small grey text below

### Technical Details

**File: `src/components/menu/TextDisplayCard.tsx`**
- Remove the prefix logic that prepends "Address:" or "Lock Box Code:" to the display text
- Show `item.name` as the primary `h3` title (same as now for plain text)
- Add a `<p className="text-xs text-muted-foreground">` subtitle below the title for address and lockbox sub-types, matching the exact pattern used in `ToolCard.tsx` (line 107)
- Subtitle values: "Address" for address type, "Lock Box Code" for lockbox type
- No subtitle for plain text type
