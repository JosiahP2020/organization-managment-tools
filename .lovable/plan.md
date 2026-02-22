

## Update TextDisplayCard Layout

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
