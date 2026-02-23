

# Fix Google Drive PDF Export to Match Current Print Formats

## Problem
The edge function's HTML generation for PDFs uses slightly outdated styling that doesn't match the current `ChecklistPrintView` and `GembaDocPrintView` components.

## Changes Required

### 1. Update `buildChecklistHtml` in `supabase/functions/google-drive-export/index.ts`

Align the checklist HTML with the exact styling from `ChecklistPrintView.tsx`:
- Checkbox size: change from 18x18px / 3px radius to **20x20px / 4px radius** with `background: white`
- Border bottom on header: ensure it's `2px solid black`
- Item borders: use `border-bottom: 1px solid #e5e7eb` (Tailwind `border-gray-200`)
- Item padding: `padding: 8px 0` matches `py-2`
- Section items container: add `padding-left: 8px` to match `pl-2`
- Ensure sub-items use `margin-left: 24px` per depth level

### 2. Update `buildGembaDocHtml` in `supabase/functions/google-drive-export/index.ts`

This has the bigger differences from `GembaDocPrintView.tsx`:
- Add `@page { size: landscape; }` for landscape orientation (the default)
- Pages should fill `100vh` height with `display: flex; flex-direction: column`
- Grid should use `flex: 1` instead of fixed `200px` row heights
- Cell images: use `width: 100%; height: 100%; object-fit: cover`
- Step badge styling: match exact colors (`hsl(22, 90%, 54%)`) and sizing
- Step text: use `font-family: Inter, system-ui; font-size: 0.8rem; font-weight: 600`
- Empty cells: render as transparent (no content, no border)
- Page breaks: add `page-break-after: always` per page
- Header padding/margins: match `0.375rem` padding, `0.5rem` margin-bottom
- Remove footers (as per the design spec — maximize image space)

### 3. Redeploy the edge function

Deploy the updated `google-drive-export` function.

## Technical Details

The core file to modify is `supabase/functions/google-drive-export/index.ts`, specifically:
- `buildChecklistHtml()` (lines 374-445) — minor CSS tweaks
- `buildGembaDocHtml()` (lines 448-506) — significant CSS rewrite to match the full-page landscape layout with flex grid

Both functions will use the organization's accent color (already passed in) and the `@page` CSS directive for proper print sizing. The SOP guide will default to landscape orientation using the doc's `orientation` field.

