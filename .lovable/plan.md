
# Plan: Widget Grid Layout - Horizontal Flow

## Overview
Change the widget display from a single vertical column to a 2-column grid layout that flows left to right, then down. This will utilize the full width and eliminate the empty space on the right side of the widgets section.

## Current Issue
Looking at the screenshot, the widgets (Quick Stats, Recent Activity, Notifications) are stacked in a single column on the left side below the menu cards, leaving an empty column to the right.

## Implementation

### File: `src/components/dashboard/DashboardCategoryGrid.tsx`

**Change 1: Update Mobile Widget Container**
- The mobile widget section currently uses a grid that contains `WidgetColumn` as a single item
- Change to render widgets directly in a 2-column grid

**Change 2: Modify Widget Rendering Approach**
- Instead of rendering `<WidgetColumn />` which stacks widgets vertically
- Render each widget individually inside a 2-column grid container

### File: `src/components/dashboard/WidgetPlaceholder.tsx`

**Change 3: Create New Grid-Based Widget Component**
- Add a new `WidgetGrid` component that renders widgets in a horizontal grid flow
- Uses `grid grid-cols-1 sm:grid-cols-2 gap-4` to create 2-column flow
- Widgets fill left to right, then wrap to the next row

**Layout Changes:**
```
Current Layout:           New Layout:
┌─────────┐               ┌─────────┬─────────┐
│Widget 1 │               │Widget 1 │Widget 2 │
├─────────┤     →         ├─────────┼─────────┤
│Widget 2 │               │Widget 3 │  (Add)  │
├─────────┤               └─────────┴─────────┘
│Widget 3 │
└─────────┘
```

## Technical Details

1. **New WidgetGrid Component** in `WidgetPlaceholder.tsx`:
   - Uses CSS Grid with `grid-cols-2` for desktop
   - Falls back to single column on very small screens
   - Maintains the same widget instances and add functionality

2. **DashboardCategoryGrid.tsx Updates**:
   - Replace `<WidgetColumn />` with new `<WidgetGrid />` in the mobile widget section
   - Keep the right sidebar layout using `WidgetColumn` for the "Grid + Right Column" layout on large screens (or optionally switch to grid there too)

3. **Grid Classes**:
   - `grid grid-cols-1 sm:grid-cols-2 gap-4` for responsive 2-column flow
   - Widgets will automatically flow left-to-right, then wrap

## Files to Modify
1. `src/components/dashboard/WidgetPlaceholder.tsx` - Add new `WidgetGrid` export
2. `src/components/dashboard/DashboardCategoryGrid.tsx` - Use `WidgetGrid` for below-cards widget section

## Theme & Styling
- No new colors or accents added - uses existing widget styling
- Works with both dark and light themes as widgets already support theming
