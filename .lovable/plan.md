

# Dashboard Add Menu Card Feature

## Overview
Add a subtle "Add" button (ghost design with circular dashed plus icon) to the dashboard that appears in available empty spaces next to/below existing menu cards. For now, clicking this button will allow adding a new menu card.

## Current State Analysis
- The dashboard displays menu cards in a responsive 2-column grid on desktop, 1-column on mobile
- Cards are fetched from the `menu_categories` table via the `useDashboardCategories` hook
- Three card style variants exist: Left Accent, Stat Card, and Clean Minimal
- The `dashboard_widgets` table exists for widgets but no widget functionality is implemented yet
- The UI follows a minimalist aesthetic with the organization's accent color

## Implementation Plan

### 1. Create the Add Menu Card Button Component
**File: `src/components/dashboard/AddMenuCardButton.tsx`**

Create a new component for the ghost-style add button:
- Circular dashed border design with a Plus icon
- Uses `border-dashed border-muted-foreground/30` for subtle appearance
- Hover state transitions to the accent color
- Size matches the height of existing menu cards
- Touch-friendly (min 44x44px target)

### 2. Create the Add Menu Card Dialog
**File: `src/components/dashboard/AddMenuCardDialog.tsx`**

Dialog for creating a new menu category:
- Fields: Name (required), Description (optional), Icon (with IconPicker)
- Uses existing `IconPicker` component for icon selection
- Inserts into `menu_categories` table with:
  - `show_on_dashboard: true`
  - `show_in_sidebar: true`
  - Auto-calculated `sort_order`
- Invalidates the dashboard categories query on success

### 3. Update the DashboardCategoryGrid Component
**File: `src/components/dashboard/DashboardCategoryGrid.tsx`**

Modify to include the add button:
- Add the ghost plus button after the last category card in the grid
- Button only visible to admin users (using `isAdmin` from AuthContext)
- Maintains responsive grid layout:
  - Desktop: Button appears in the next available grid cell
  - Mobile: Button stacks below existing cards
- Dialog state management for the add card flow

## Technical Details

### Add Button Design (Ghost Style)
```text
+------------------+
|                  |
|    +-------+     |
|    |   +   |     |  <- Circular dashed border
|    +-------+     |     with Plus icon centered
|                  |
+------------------+
     Card-height     
     container
```

Styling approach:
- Container: Same height as category cards, dashed border
- Inner circle: `rounded-full border-2 border-dashed`
- Icon: `Plus` from lucide-react, muted color by default
- Hover: Border and icon transition to primary accent color

### Database Interaction
Uses existing `menu_categories` table structure:
- `name`: Required string
- `icon`: Defaults to "folder"
- `description`: Optional
- `organization_id`: From current user's organization
- `created_by`: Current user ID
- `show_on_dashboard`: true
- `show_in_sidebar`: true
- `sort_order`: Max existing + 1

### Admin-Only Visibility
The add button will only be visible when `isAdmin` is true from the AuthContext, ensuring only administrators can add new menu cards.

## Files to Create/Modify
1. **Create**: `src/components/dashboard/AddMenuCardButton.tsx` - Ghost add button component
2. **Create**: `src/components/dashboard/AddMenuCardDialog.tsx` - Dialog for adding menu cards
3. **Modify**: `src/components/dashboard/DashboardCategoryGrid.tsx` - Integrate add button into grid

## Theme Compatibility
- Uses Tailwind CSS classes that work with both light and dark themes
- Border colors use `border-muted-foreground/30` for subtle appearance
- Hover states use `primary` color for accent (organization's accent color)
- All text uses `text-foreground` and `text-muted-foreground` for theme compatibility

