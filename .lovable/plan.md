
# Complete Implementation Plan: All Features in One Phase

## Overview

This plan consolidates ALL remaining features into a single implementation phase, addressing every item from our previous discussions:

1. Logo size increase in sub-menus
2. EditModeToggle position fix (moves right when Settings gear is hidden)
3. Sidebar Dashboard button gap fix
4. Add Item menu overhaul (5 options in correct order)
5. Section Categories feature
6. Widgets System (pre-built + customizable Widget Builder)

---

## 1. Logo Size Increase in Sub-Menus

**Current State:** The logo in `EditableCategoryHeader.tsx` uses `h-20 w-auto max-w-[240px]`

**Fix:** Increase the logo size to match the larger display on the dashboard

### File to Modify:
- `src/components/category/EditableCategoryHeader.tsx`

### Change:
```
Line 51: h-20 w-auto max-w-[240px]
    ↓
h-36 w-auto max-h-32 md:max-h-40
```

This matches the dashboard logo sizing from the session replay.

---

## 2. EditModeToggle Position Fix

**Issue:** When on submenu/category pages, the Settings gear disappears but the Locked/Editing badge stays at `right-24`, leaving a floating gap.

**Solution:** Detect the current route and dynamically adjust position.

### File to Modify:
- `src/components/EditModeToggle.tsx`

### Changes:
- Import `useLocation` from react-router-dom
- Check if on main dashboard (`/dashboard/{slug}` with no additional path segments)
- Main dashboard: `right-24` (Settings gear visible)
- All other pages: `right-4` (Settings gear hidden)

### Logic:
```text
path = "/dashboard/shellstar" → right-24
path = "/dashboard/shellstar/category/abc" → right-4
path = "/dashboard/shellstar/training" → right-4
```

---

## 3. Sidebar Dashboard Button Gap Fix

**Issue:** Large gap between the user profile section and Dashboard button because Dashboard is in its own SidebarGroup with default padding.

**Current Structure (lines 131-149 of DynamicSidebar.tsx):**
```text
<SidebarGroup>  ← Has default p-2 padding = GAP
  <SidebarGroupContent>
    <SidebarMenu>
      <SidebarMenuItem>Dashboard</SidebarMenuItem>
```

**Solution:** Add `className="pt-0"` to remove top padding from the Dashboard's SidebarGroup.

### File to Modify:
- `src/components/DynamicSidebar.tsx`

### Change:
```
Line 131: <SidebarGroup>
    ↓
<SidebarGroup className="pt-0">
```

---

## 4. Add Item Menu Overhaul

**Current State:** AddItemCard has 4 wrong options (subcategory, file_directory, checklist, sop_guide)

**Required Options (5 total, in this exact order):**
1. Section Category - Grouping container
2. Submenu - Creates a new child menu
3. File Directory - Searchable document storage
4. Tool - Checklist, SOP Guide, or Project Hub
5. Widget - Dashboard widget embedded in menu page

### Files to Modify/Create:

| File | Action |
|------|--------|
| `src/components/category/AddItemCard.tsx` | Modify - New ItemType and 5 options |
| `src/components/category/AddSectionDialog.tsx` | Create - Dialog for sections |
| `src/components/category/AddWidgetDialog.tsx` | Create - Dialog for widgets |
| `src/pages/CategoryDetailPage.tsx` | Modify - Handle new item types |

### Updated ItemType:
```typescript
type ItemType = "section_category" | "submenu" | "file_directory" | "tool" | "widget"
```

### New Dropdown Order with Icons:
```text
┌──────────────────────────────────┐
│ 📑 Section Category              │  LayoutList icon
│ 📁 Submenu                       │  FolderPlus icon
│ 📂 File Directory                │  FileBox icon
│ 🔧 Tool                          │  Wrench icon
│ 📊 Widget                        │  LayoutDashboard icon
└──────────────────────────────────┘
```

### Handler Mapping:
- Section Category → Opens `AddSectionDialog` (new)
- Submenu → Opens `QuickCategoryDialog` with `parent_category_id` set
- File Directory → Opens `AddMenuItemDialog` with type pre-selected
- Tool → Opens `AddMenuItemDialog` with type pre-selected
- Widget → Opens `AddWidgetDialog` (new)

---

## 5. Section Categories Feature

**Purpose:** Create collapsible grouping containers within menu pages.

### Database Migration Required:
Add `section_id` column to `menu_items` table.

```sql
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_menu_items_section_id ON public.menu_items(section_id);
```

### Visual Structure:
```text
┌─────────────────────────────────────┐
│ ▼ Safety Documents                  │  ← Section (collapsible)
│   ├── 📋 Fire Safety Checklist      │
│   ├── 📄 Emergency Procedures       │
│   └── 📖 First Aid Guide            │
├─────────────────────────────────────┤
│ ▼ Training Materials                │  ← Another section
│   ├── 📋 Onboarding Checklist       │
│   └── 📄 Equipment Guide            │
├─────────────────────────────────────┤
│ (Ungrouped items)                   │  ← Items with section_id = null
└─────────────────────────────────────┘
```

### Files to Create:

| File | Purpose |
|------|---------|
| `src/components/category/AddSectionDialog.tsx` | Dialog for creating sections (name, description, icon) |
| `src/components/category/SectionContainer.tsx` | Collapsible wrapper with header, edit/delete controls |
| `src/hooks/useSections.tsx` | Hook for section CRUD operations |

### CategoryDetailPage Changes:
1. Fetch items with their `section_id`
2. Group items by section
3. Render sections as collapsible containers
4. Render ungrouped items (section_id = null) at the end

---

## 6. Widgets System

**Two Modes:**

### A. Pre-Built Widgets (Quick Add - One Click)
1. Recent Activity - Shows latest user actions
2. Pinned Items - User's pinned documents
3. Document Stats - Count of checklists, guides, files
4. Quick Links - Configurable shortcuts
5. Progress Tracker - Completion percentages

### B. Customizable Widgets (Widget Builder)

Multi-step wizard for creating custom widgets:

**Step 1: Choose Widget Type**
```text
○ Recent Activity
○ Pinned Items
○ Document Stats
○ Quick Links
○ Progress Tracker
```

**Step 2: Configure Data Source**
- Category filter (all or specific category)
- Date range (7 days, 30 days, all time)
- Item limit (5, 10, 20, 50)
- Status filter (active, archived, completed)

**Step 3: Display Options**
- Display type: List, Counter, Progress Bar, Quick Links, Table
- Size: Small, Medium, Large

**Step 4: Name and Save**
- Widget name
- Position preference

### Files to Create:

| File | Purpose |
|------|---------|
| `src/hooks/useWidgets.tsx` | Widget CRUD operations |
| `src/components/widgets/WidgetRenderer.tsx` | Renders correct widget type |
| `src/components/widgets/RecentActivityWidget.tsx` | Activity log widget |
| `src/components/widgets/PinnedItemsWidget.tsx` | Pinned items widget |
| `src/components/widgets/DocumentStatsWidget.tsx` | Document counts widget |
| `src/components/widgets/QuickLinksWidget.tsx` | Quick links widget |
| `src/components/widgets/ProgressWidget.tsx` | Progress tracker widget |
| `src/components/widgets/WidgetBuilder.tsx` | Multi-step custom widget wizard |
| `src/components/category/AddWidgetDialog.tsx` | Widget selection/config dialog |

### Widget Config Examples:
```json
{
  "widget_type": "recent_activity",
  "config": {
    "category_filter": "all",
    "date_range": "7d",
    "limit": 10,
    "display_type": "list"
  }
}
```

### Dashboard Integration:
Update `Dashboard.tsx` to render widgets based on `dashboard_layout` setting:
- `grid-right-column`: Widget column on right
- `full-width`: Widgets as top row
- `sidebar-left`: Widgets in sidebar area
- `masonry`: Widgets mixed with cards

### Menu Page Integration:
Widgets can also be embedded in `CategoryDetailPage.tsx` when added via the Add Item menu.

---

## Summary of All Changes

| Category | New Files | Modified Files | Database |
|----------|-----------|----------------|----------|
| Logo Size | - | `EditableCategoryHeader.tsx` | - |
| EditModeToggle Position | - | `EditModeToggle.tsx` | - |
| Sidebar Gap | - | `DynamicSidebar.tsx` | - |
| Add Item Menu | `AddSectionDialog.tsx`, `AddWidgetDialog.tsx` | `AddItemCard.tsx`, `CategoryDetailPage.tsx` | - |
| Section Categories | `SectionContainer.tsx`, `useSections.tsx` | `CategoryDetailPage.tsx` | Migration |
| Widgets | 8 widget files + `useWidgets.tsx` | `Dashboard.tsx`, `CategoryDetailPage.tsx` | - |

**Total: ~12 new files, 7 modified files, 1 database migration**

---

## Verification Steps

### After Implementation:
1. **Logo Size:** Navigate to a category page and verify logo is larger (h-36)
2. **EditModeToggle:** On dashboard, badge should be at right-24. On category pages, badge should be at right-4.
3. **Sidebar Gap:** Dashboard button should be flush with profile section (no gap)
4. **Add Item Menu:** Click Add Item and verify 5 options in order: Section Category, Submenu, File Directory, Tool, Widget
5. **Section Categories:** Create a section, add items to it, verify collapsible behavior
6. **Widgets:** Add a pre-built widget, verify display. Open Widget Builder, create custom widget.
