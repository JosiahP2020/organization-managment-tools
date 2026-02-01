
# Plan: Fix Dashboard Menu Section Issues

## Overview
Fix four issues with the dashboard menu sections feature:
1. Adding menus not refreshing the UI
2. Main section title not always available and centered
3. Extra plus icon appearing incorrectly
4. Delete button visible when it should only show on hover

## Issue 1: Add Menu Not Working (Query Cache Mismatch)

### Root Cause
In `AddMenuCardDialog.tsx`, after creating a menu, the code invalidates query key `["dashboard-categories"]`, but the actual query in `useDashboardSections.tsx` uses `["dashboard-categories-with-sections"]`. The menu is created in the database, but the UI doesn't refresh.

### Fix
Update `AddMenuCardDialog.tsx` line 61 to invalidate the correct query key:
```typescript
queryClient.invalidateQueries({ queryKey: ["dashboard-categories-with-sections"] });
```

## Issue 2: Main Section Title Always Available and Centered

### Current Behavior
- Unsorted categories only show "Main" title when other sections exist
- The title is hardcoded, not editable

### New Behavior
- Always show a default section for cards without a section_id
- Make this "Main" title editable just like other sections
- Keep it centered within the grid

### Implementation
Create a virtual "Main" section for unsorted categories that behaves like a regular `DashboardSection`:
- Modify `DashboardCategoryGrid.tsx` to treat unsorted categories as a pseudo-section
- Render using the same `DashboardSection` component but with special handling for the "Main" section (no database ID, uses null section_id)
- The "Main" section title can be stored in organization settings or remain as a simple label

### Simpler Approach
Since "Main" is a conceptual grouping for unsorted items:
- Always display the centered title for unsorted categories
- Make it visually consistent with section titles
- For the first/main section, just show a centered "Main" title (non-editable) in the same style as section titles

## Issue 3: Extra Plus Icon

### Current State
Multiple `AddMenuCardButton` instances appear:
1. Inside each `DashboardSection` (for adding menus to that section)
2. For unsorted categories grid
3. At the bottom of the page (for adding new sections)

### Problem
The bottom button (lines 145-152 in `DashboardCategoryGrid.tsx`) shows when there are sections OR no unsorted categories, creating a duplicate.

### Fix
Remove or consolidate the extra button:
- The button inside `DashboardSection` already allows adding menus
- Each section should have its own "+" in the grid
- Only show ONE add button at the very bottom for creating new sections (not menus)
- Or: Only show the bottom button if specifically needed

Update `DashboardCategoryGrid.tsx` to:
- Remove the duplicate bottom `AddMenuCardButton` when sections already provide add capability
- OR change the bottom button to only offer "Add Section" (not Menu)

## Issue 4: Delete Button Only on Hover

### Current State
The delete button is always visible when admin and not editing (lines 123-132 in `DashboardSection.tsx`).

### Fix
Add hover state tracking using a group class and CSS:
```tsx
<div 
  className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 py-2 group"
>
  {/* ... title content ... */}
  
  {isAdmin && !isEditing && (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => setShowDeleteConfirm(true)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )}
</div>
```

## Files to Modify

1. **`src/components/dashboard/AddMenuCardDialog.tsx`**
   - Fix query key from `["dashboard-categories"]` to `["dashboard-categories-with-sections"]`

2. **`src/components/dashboard/DashboardSection.tsx`**
   - Add `group` class to the title container
   - Add `opacity-0 group-hover:opacity-100 transition-opacity` to delete button

3. **`src/components/dashboard/DashboardCategoryGrid.tsx`**
   - Always show centered "Main" title for unsorted categories section
   - Remove or consolidate duplicate add button at the bottom
   - Ensure only one "+" icon per section

## Technical Details

### Query Key Fix (AddMenuCardDialog.tsx)
Change line 61:
- Before: `queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });`
- After: `queryClient.invalidateQueries({ queryKey: ["dashboard-categories-with-sections"] });`

### Delete Button Hover (DashboardSection.tsx)
Add `group` to the container div (line 100) and update Button classes (lines 124-131) to include opacity transition.

### Main Title Always Visible (DashboardCategoryGrid.tsx)
Update lines 106-130 to always render a centered "Main" title (matching section title styling), regardless of whether other sections exist.

### Remove Duplicate Button (DashboardCategoryGrid.tsx)
Remove or modify lines 145-152 to prevent duplicate plus icons from appearing.
