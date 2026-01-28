

# Phase A: Design Preview Page Implementation

## Overview

Create an isolated design preview environment at `/dev/design-preview` to showcase multiple UI variations without affecting the main application. This will allow you to browse and select preferred styles before we implement them across the app.

---

## Confirmation: Customizable Widgets

Yes, widgets will be fully customizable with your own data sources. The `dashboard_widgets` table has a `config` column (JSONB type) that can store:

- Custom API endpoints
- Database queries or filters
- Display settings (colors, layouts)
- Data refresh intervals
- Any custom configuration you need

When we implement widgets in Phase B, each widget type will have its own configuration schema, and you'll be able to create completely custom widgets.

---

## New Files to Create

### 1. Main Preview Page
**File:** `src/pages/dev/DesignPreview.tsx`

Main container page with:
- Navigation between design sections
- Section tabs: Cards, Navigation, Add Buttons, Edit Triggers, Layouts
- Mock dashboard header (menu button left, settings right, centered logo)
- Easy section navigation with scroll or tabs

### 2. Dashboard Card Showcase
**File:** `src/components/dev/CardStyleShowcase.tsx`

15+ card variations including:
1. **Current Style** - Reference of what exists now (bubbly rectangle)
2. **Clean Minimal** - No icon background box, just icon and text
3. **Left Accent Bar** - Thin colored line on left edge
4. **Icon Badge** - Small circle icon, title beside it
5. **Tile Grid** - Square tiles like iOS app icons
6. **List Row** - Horizontal rows with icon, title, description
7. **Stat Card** - Shows item count badge
8. **Sharp Corners** - No border radius, subtle shadow
9. **Borderless Hover** - No visible border until hover
10. **Underline Accent** - Bottom border highlight on hover
11. **Thin Border** - 1px border, very minimal
12. **Gradient Accent** - Subtle gradient on edge
13. **Compact Horizontal** - Icon left, text right, small height
14. **Two-Tone** - Split background color
15. **Glass Morphism** - Blur backdrop effect

Each card shows "Shop & Install" as sample content with an icon.

### 3. Navigation Item Showcase
**File:** `src/components/dev/NavItemShowcase.tsx`

10+ navigation/menu item variations:
1. **Current Style** - Reference (rounded with hover)
2. **Sharp Corner** - No border radius
3. **Rounded Pill** - Full pill shape
4. **Underline Hover** - Line appears below on hover
5. **Left Border Accent** - Colored left edge when active
6. **Background Only** - No borders, just bg highlight
7. **Icon Forward** - Icon larger, text smaller
8. **Full Width List** - Takes entire width
9. **Compact Grid** - Smaller, grid-ready items
10. **Tab Style** - Like browser tabs

### 4. Add Button Showcase
**File:** `src/components/dev/AddButtonShowcase.tsx`

8+ alternatives to the dashed circle button:
1. **Current Dashed Circle** - Reference
2. **Text Link** - "+ Add item" text link
3. **Ghost Button** - Outlined button with label
4. **Rectangular Outlined** - Box with plus icon
5. **Floating Action** - FAB-style circle
6. **Inline Text** - Minimal "+ Add" inline
7. **Subtle Card** - Faded card that hints at adding
8. **Icon with Tooltip** - Plus icon, tooltip on hover
9. **Expandable** - Icon that expands to full button on hover

### 5. Edit Mode Trigger Showcase
**File:** `src/components/dev/EditTriggerShowcase.tsx`

5+ placement and style options:
1. **Header Bar Right** - Button next to settings gear
2. **Header Bar Left** - Button next to menu button
3. **Floating Bottom Right** - Fixed position corner
4. **Floating Bottom Left** - Fixed position corner
5. **Top Right Badge** - Small badge-style toggle

Each shows both "off" and "on" states.

### 6. Layout Showcase
**File:** `src/components/dev/LayoutShowcase.tsx`

5+ dashboard layout arrangements:
1. **Full Width Grid** - Current (no widgets)
2. **Grid + Right Column** - Menus left, widgets right
3. **Top Widgets + Grid** - Widget row above menus
4. **Corner Widgets** - Small widget area in top-right
5. **Bottom Widgets** - Footer-style widget row

Each shows a mini preview of the layout arrangement.

---

## Route Addition

**File:** `src/App.tsx`

Add temporary route:
```tsx
<Route path="/dev/design-preview" element={<DesignPreview />} />
```

---

## How to Access

Navigate directly to: `/dev/design-preview`

The page will include:
- A "Back to Dashboard" button to return
- Clear section headers
- Each variation labeled with a number and name
- Visual groupings by category

---

## Preview Page Structure

```text
+----------------------------------------------------------+
|  [Back to Dashboard]           Design Preview            |
+----------------------------------------------------------+
|  [ Cards ] [ Navigation ] [ Add Buttons ] [ Edit ] [ Layouts ]
+----------------------------------------------------------+
|                                                          |
|  DASHBOARD CARD STYLES                                   |
|  ---------------------------                             |
|                                                          |
|  1. Current Style    2. Clean Minimal    3. Left Accent  |
|  +-------------+     +-------------+     +-------------+ |
|  |   [icon]   |     |   icon      |     | |  icon     | |
|  | Shop & Inst|     | Shop & Inst |     | | Shop & In | |
|  +-------------+     +-------------+     +-------------+ |
|                                                          |
|  4. Icon Badge      5. Tile Grid        6. List Row      |
|  ... (continues)                                         |
|                                                          |
+----------------------------------------------------------+
```

---

## Technical Notes

- All components are self-contained in `/dev/` folder for easy deletion later
- No dependencies on main app state (uses static mock data)
- Responsive design so you can preview on mobile too
- Dark mode compatible (uses theme tokens)
- Each variation is clearly numbered for easy reference

---

## Implementation Order

1. Create folder structure: `src/pages/dev/` and `src/components/dev/`
2. Create the main `DesignPreview.tsx` page with tab navigation
3. Create `CardStyleShowcase.tsx` with all 15+ variations
4. Create `NavItemShowcase.tsx` with all 10+ variations
5. Create `AddButtonShowcase.tsx` with all 8+ variations
6. Create `EditTriggerShowcase.tsx` with all 5+ placement options
7. Create `LayoutShowcase.tsx` with all 5+ layout arrangements
8. Add route to `App.tsx`
9. Test navigation and visual display

---

## After Selection

Once you browse and identify your preferred styles:
- Note the numbers/names of your choices
- We proceed to Phase B implementation
- Apply selected styles across the real components
- Delete all `/dev/` files when complete

---

## Files Summary

| File | Purpose |
|------|---------|
| `src/pages/dev/DesignPreview.tsx` | Main preview page with tabs |
| `src/components/dev/CardStyleShowcase.tsx` | 15+ dashboard card variations |
| `src/components/dev/NavItemShowcase.tsx` | 10+ navigation item variations |
| `src/components/dev/AddButtonShowcase.tsx` | 8+ add button variations |
| `src/components/dev/EditTriggerShowcase.tsx` | 5+ edit mode trigger options |
| `src/components/dev/LayoutShowcase.tsx` | 5+ dashboard layout options |
| `src/App.tsx` | Add dev route (1 line) |

**Total: 6 new files + 1 minor edit**

