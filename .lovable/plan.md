
# Fully Inline Navigation Editing System

## Overview

Transform the current navigation system so that all categories, menu items, and content can be created, edited, renamed, rearranged, and deleted directly from wherever they appear in the app. Remove the separate Menu Configuration page entirely. New organizations will start with default categories ("Shop & Install" and "SOP") that are real database entries, fully customizable from day one.

---

## Core Principles

1. **Edit where you see it** - No separate configuration pages; click to edit right there
2. **Visual consistency** - Plus buttons and edit icons use the same patterns everywhere
3. **Non-intrusive for employees** - Edit controls only visible to admins
4. **Seeded defaults** - New organizations get starter categories they can modify or delete

---

## Architecture Changes

### Remove Separate Menu Configuration Page
- Delete `src/pages/admin/MenuConfiguration.tsx`
- Delete `src/components/menu-config/MenuCategoryEditor.tsx`
- Remove route from `src/App.tsx`
- Remove links from `DashboardHeader.tsx` and `DynamicNavigationMenu.tsx`

### Keep Reusable Components
- `IconPicker.tsx` - Used in inline dialogs
- `DynamicIcon.tsx` - Used everywhere
- `AddMenuItemDialog.tsx` - Reuse for adding items within categories
- `EditMenuItemDialog.tsx` - Reuse for editing items

---

## Implementation Tasks

### Phase 1: Seed Default Categories on Organization Creation

**File: `src/pages/CreateOrganization.tsx`**

After creating the organization, profile, and admin role (around line 177), insert default categories:

```text
1. Insert "Shop & Install" category
   - icon: "wrench"
   - description: "Project management, follow-up lists, and measurement tools."
   - show_on_dashboard: true
   - show_in_sidebar: true
   - sort_order: 0

2. Insert "SOP" category
   - icon: "graduation-cap"
   - description: "SOP, Machine Operation, and Machine Maintenance."
   - show_on_dashboard: true
   - show_in_sidebar: true
   - sort_order: 1
```

This ensures every new organization starts with editable, deletable default categories.

---

### Phase 2: Redesign Dashboard Cards with Inline Editing

**New Component: `src/components/dashboard/EditableCategoryCard.tsx`**

A category card that includes admin editing capabilities:
- Normal appearance for all users
- Admin hover reveals: Edit button (pencil icon, top-right)
- Click edit opens a quick dialog for:
  - Rename (inline input)
  - Change icon (icon picker)
  - Edit description
  - Toggle dashboard/sidebar visibility
  - Delete button (with confirmation)

**New Component: `src/components/dashboard/AddCategoryCard.tsx`**

A ghost/placeholder card at the end of the grid:
- Dashed border with subtle background
- Plus icon in center
- "Add Category" text below
- Only visible to admins
- Click opens simple "Add Category" dialog

**New Component: `src/components/dashboard/QuickCategoryDialog.tsx`**

Streamlined dialog for creating/editing categories:
- Name field (required)
- Icon picker
- Description field (optional)
- Advanced section (collapsible):
  - Show on Dashboard toggle
  - Show in Sidebar toggle
- Delete button (only in edit mode, with confirmation)

---

### Phase 3: Update Dashboard Grid

**File: `src/components/dashboard/DashboardCategoryGrid.tsx`**

Complete rewrite:
- Remove all static fallback cards
- Remove `StaticCategoryCard` component
- Remove admin hint text
- Render `EditableCategoryCard` for each database category
- Append `AddCategoryCard` at the end for admins
- Empty state: Just show `AddCategoryCard` with helpful text

---

### Phase 4: Inline Editing on Category Detail Page

**File: `src/pages/CategoryDetailPage.tsx`**

Add inline editing capabilities:

1. **Category Header Editing (Admin)**
   - Click category name to edit inline
   - Edit icon next to category name opens quick edit dialog
   - Can change name, icon, description, delete category

2. **Editable Item Cards**
   - Admin hover reveals edit button on each subcategory/item card
   - Click edit opens appropriate dialog (EditCategoryDialog for subcategories, EditMenuItemDialog for items)

3. **Add Item/Subcategory Button**
   - Ghost card at end of grid for admins
   - Click opens type selector:
     - "Add Subcategory" - Creates child category
     - "Add File Directory" - Creates file_directory item
     - "Add Checklist" - Creates tool item
     - "Add SOP Guide" - Creates tool item

4. **Empty State Enhancement**
   - Current: "This category is empty. Add items in Menu Configuration."
   - New: Shows AddItemCard for admins, friendly message for employees

---

### Phase 5: Improve Card Visual Design

Update card styling across all components:

**Current Design:**
```css
border-border
hover:border-primary/30
transition-all duration-300
hover:shadow-lg
```

**New Design:**
```css
shadow-sm
border border-border/50
rounded-xl
hover:shadow-md
hover:scale-[1.02]
transition-all duration-200
bg-card
```

**Ghost/Add Card Design:**
```css
border-2 border-dashed border-muted-foreground/30
bg-muted/20
rounded-xl
hover:border-primary/50
hover:bg-accent/30
```

---

### Phase 6: Update Sidebar Navigation

**File: `src/components/DynamicSidebar.tsx`** (or equivalent)

Ensure sidebar dynamically reflects database categories:
- Fetch categories where `show_in_sidebar: true`
- No hardcoded fallbacks
- Categories are clickable and route correctly

---

### Phase 7: Remove Old Components

**Delete:**
- `src/pages/admin/MenuConfiguration.tsx`
- `src/components/menu-config/MenuCategoryEditor.tsx`
- `src/components/menu-config/MenuItemEditor.tsx`
- `src/components/dashboard/AdminGetStartedCard.tsx`

**Update `src/App.tsx`:**
- Remove MenuConfiguration import and route

**Update `src/components/DashboardHeader.tsx`:**
- Remove "Menu Configuration" link from settings dropdown

**Update `src/components/DynamicNavigationMenu.tsx`:**
- Remove "Menu Configuration" from Admin section
- Keep Users and Organization Settings

---

## File Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/dashboard/EditableCategoryCard.tsx` | Category card with admin edit overlay |
| `src/components/dashboard/AddCategoryCard.tsx` | Ghost card with plus icon for adding categories |
| `src/components/dashboard/QuickCategoryDialog.tsx` | Streamlined create/edit category dialog |
| `src/components/category/EditableCategoryHeader.tsx` | Inline editable header for category detail page |
| `src/components/category/AddItemCard.tsx` | Ghost card for adding items in category detail |
| `src/components/category/EditableItemCard.tsx` | Item card with admin edit overlay |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/CreateOrganization.tsx` | Add default category seeding after signup |
| `src/pages/Dashboard.tsx` | Remove AdminGetStartedCard |
| `src/components/dashboard/DashboardCategoryGrid.tsx` | Complete rewrite for inline editing |
| `src/pages/CategoryDetailPage.tsx` | Add inline editing for items and subcategories |
| `src/components/DashboardHeader.tsx` | Remove Menu Configuration link |
| `src/components/DynamicNavigationMenu.tsx` | Remove Menu Configuration link |
| `src/App.tsx` | Remove MenuConfiguration route |

### Files to Delete
| File | Reason |
|------|--------|
| `src/pages/admin/MenuConfiguration.tsx` | Replaced by inline editing |
| `src/components/menu-config/MenuCategoryEditor.tsx` | Replaced by inline editing |
| `src/components/menu-config/MenuItemEditor.tsx` | Functionality moved to CategoryDetailPage |
| `src/components/dashboard/AdminGetStartedCard.tsx` | No longer needed with seeded defaults |

---

## User Experience After Implementation

### New Organization Signup
1. Admin creates organization
2. Dashboard immediately shows "Shop & Install" and "SOP" cards
3. Admin sees subtle "+" card at the end to add more
4. Admin can click edit on any card to rename, change icon, or delete

### Admin on Dashboard
```text
+-------------------+  +-------------------+  +-------------------+
|             [pen] |  |             [pen] |  |                   |
|    [wrench]       |  |  [graduation]     |  |       [+]         |
|                   |  |                   |  |                   |
|  Shop & Install   |  |       SOP         |  |   Add Category    |
|  Project mgmt...  |  |  Standard op...   |  |                   |
+-------------------+  +-------------------+  +-------------------+
```

### Admin in Category Detail Page
```text
[wrench] Shop & Install                               [pen]
         Project management, follow-up lists...

+------------------+  +------------------+  +------------------+
|            [pen] |  |            [pen] |  |                  |
|   [projects]     |  |   [clipboard]    |  |       [+]        |
|   Projects       |  |   Follow-up List |  |    Add Item      |
+------------------+  +------------------+  +------------------+
```

### Employee Experience
- No edit buttons visible
- No plus cards visible
- Clean, distraction-free navigation
- Same cards, just without admin overlays

---

## Technical Notes

### Existing Hooks to Reuse
- `useMenuCategories()` - Has all CRUD operations ready
- `useMenuItems()` - Has all CRUD operations ready
- `useDashboardCategories()` - Fetches dashboard categories

### Existing Components to Reuse
- `IconPicker` - For selecting icons
- `DynamicIcon` - For rendering icons
- `AddMenuItemDialog` - Can be adapted for inline use
- `EditMenuItemDialog` - Can be adapted for inline use

### Admin Detection
Use existing `useAuth().isAdmin` to conditionally render edit controls.

### Drag-and-Drop (Future)
The `sort_order` column and `reorderCategories`/`reorderItems` mutations are already implemented. Drag-and-drop can be added later using a library like `@dnd-kit`.
