

# Customizable Navigation, Dashboard & Widget System

## Executive Summary

Transform the application from hardcoded navigation into a fully dynamic, organization-configurable system where admins can build custom menu structures, file directories, and dashboard widgets without any coding.

---

## Core Concepts

### Menu System

In any menu, an admin can add:

1. **Submenu** - Another nested menu (unlimited depth)
2. **File Directory** - Uploadable/searchable documents with custom title (like Google Drive)
3. **Tool** - Checklist, SOP Guide, etc. with its own file directory

A single menu page can contain **multiple categorized sections**. Example menu layout:

```text
┌─────────────────────────────────────────┐
│  Production Floor Menu                  │
├─────────────────────────────────────────┤
│  📁 Gloves (File Directory)             │
│     └─ Searchable uploaded documents    │
├─────────────────────────────────────────┤
│  ✅ CNC Checklist (Tool: Checklist)     │
│     └─ Unlimited mode, searchable list  │
├─────────────────────────────────────────┤
│  📁 Grease Tutorials (File Directory)   │
│     └─ Videos, PDFs on CNC maintenance  │
├─────────────────────────────────────────┤
│  📋 Machine Setup (Tool: SOP Guide)     │
│     └─ Single mode, one document        │
└─────────────────────────────────────────┘
```

### Tool Modes

- **Unlimited Mode**: Searchable list of documents, can create many
- **Single Mode**: One document only, opens directly (like Follow-up List)

### Widget System

- **Pre-built Widgets**: Ready to add with one click (Recent Activity, Pinned Items, Stats)
- **Widget Builder**: Create custom widgets from scratch with data sources and filters

---

## Database Schema

### Table: menu_categories

Stores top-level menus and nested submenus.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | References organizations |
| name | TEXT | Display name |
| description | TEXT | Optional description |
| icon | TEXT | Lucide icon name (default: 'folder') |
| sort_order | INTEGER | Display order |
| parent_category_id | UUID | Self-reference for nesting |
| show_on_dashboard | BOOLEAN | Show as dashboard card |
| show_in_sidebar | BOOLEAN | Show in sidebar navigation |
| created_by | UUID | Creator user ID |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Table: menu_items

Items within menus (file directories, tools, submenus).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | References organizations |
| category_id | UUID | References menu_categories |
| name | TEXT | Display name (custom title) |
| description | TEXT | Optional description |
| icon | TEXT | Lucide icon name |
| sort_order | INTEGER | Display order within category |
| item_type | TEXT | 'submenu', 'file_directory', 'tool' |
| target_category_id | UUID | For submenu type, links to category |
| is_searchable | BOOLEAN | Show search bar (for file_directory) |
| tool_type | TEXT | 'checklist', 'sop_guide', 'project_hub' |
| tool_mode | TEXT | 'unlimited' or 'single' |
| tool_is_searchable | BOOLEAN | Show search for tool's file list |
| created_by | UUID | Creator user ID |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Table: menu_item_documents

Documents uploaded to file directories or created by tools.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | References organizations |
| menu_item_id | UUID | References menu_items |
| document_type | TEXT | 'file', 'checklist', 'sop_guide', etc. |
| document_id | UUID | References tool documents if applicable |
| title | TEXT | Document title |
| file_url | TEXT | Storage URL for uploaded files |
| file_name | TEXT | Original filename |
| file_type | TEXT | MIME type |
| created_by | UUID | Uploader user ID |
| archived_at | TIMESTAMPTZ | Soft delete timestamp |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Table: dashboard_widgets

Widgets displayed on organization dashboards.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | References organizations |
| widget_type | TEXT | 'category_card', 'recent_activity', 'pinned_items', 'document_stats', 'quick_links', 'progress', 'custom' |
| name | TEXT | Display name (editable) |
| position | INTEGER | Order on dashboard |
| size | TEXT | 'small', 'normal', 'large' |
| is_visible | BOOLEAN | Show/hide toggle |
| config | JSONB | Widget-specific settings |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Table: pinned_items

User-specific pinned documents for quick access.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| organization_id | UUID | References organizations |
| document_type | TEXT | 'checklist', 'sop_guide', 'file' |
| document_id | UUID | Reference to document |
| pinned_at | TIMESTAMPTZ | When pinned |
| sort_order | INTEGER | Order in pinned list |

### Table: activity_log

Tracks user actions for Recent Activity widget.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | References organizations |
| user_id | UUID | Acting user |
| action_type | TEXT | 'created', 'updated', 'completed', 'viewed', 'deleted', 'archived' |
| entity_type | TEXT | 'checklist', 'sop_guide', 'file', 'project', 'menu' |
| entity_id | UUID | Reference to entity |
| entity_name | TEXT | Display name for activity feed |
| metadata | JSONB | Additional context |
| created_at | TIMESTAMPTZ | When action occurred |

---

## RLS Policies

All new tables will have organization-scoped Row-Level Security:

**SELECT (View)**: All organization members can view their org's data
**INSERT/UPDATE/DELETE (Modify)**: Only admins can modify menu structure and widgets
**Pinned Items**: Users can manage their own pins only
**Activity Log**: Insert-only, no user modification

Uses existing `is_org_admin()` and `get_user_organization()` security definer functions.

---

## New Components

### Menu Configuration Components

| Component | Purpose |
|-----------|---------|
| DynamicIcon.tsx | Renders Lucide icons by string name |
| IconPicker.tsx | Visual icon selection grid for admins |
| MenuCategoryEditor.tsx | Manage menu categories |
| MenuItemEditor.tsx | Manage items within categories |
| AddMenuItemDialog.tsx | Dialog to add new menu items |
| MenuItemTypeSelector.tsx | Choose between submenu/file_directory/tool |

### Dashboard Configuration Components

| Component | Purpose |
|-----------|---------|
| DashboardLayoutEditor.tsx | Arrange widgets on dashboard |
| WidgetGallery.tsx | Browse available widgets |
| WidgetBuilder.tsx | Create custom widgets |
| WidgetConfigDialog.tsx | Configure widget settings |

### Widget Components

| Component | Purpose |
|-----------|---------|
| RecentActivityWidget.tsx | Shows recent actions feed |
| PinnedItemsWidget.tsx | User's pinned quick access |
| DocumentStatsWidget.tsx | Document counts |
| QuickLinksWidget.tsx | Category shortcut buttons |
| ProgressWidget.tsx | Completion progress bars |
| CustomWidget.tsx | Renders custom widget configs |

### Navigation Components

| Component | Purpose |
|-----------|---------|
| DynamicSidebar.tsx | Data-driven sidebar |
| DynamicNavMenu.tsx | Data-driven mobile menu |
| DynamicBreadcrumb.tsx | Context-aware breadcrumbs |

### File Directory Components

| Component | Purpose |
|-----------|---------|
| FileDirectoryView.tsx | List/grid of uploaded files |
| FileUploadDialog.tsx | Upload new files |
| FileSearchBar.tsx | Search within directory |

### Page Components

| Component | Purpose |
|-----------|---------|
| DynamicCategoryPage.tsx | Renders menu categories |
| DynamicItemPage.tsx | Renders specific menu items |
| MenuConfiguration.tsx | Admin configuration page |

### Hooks

| Hook | Purpose |
|------|---------|
| useMenuCategories.tsx | Fetch/manage categories |
| useMenuItems.tsx | Fetch/manage menu items |
| useDashboardWidgets.tsx | Fetch/manage widgets |
| useActivityLog.tsx | Log and fetch activity |
| usePinnedItems.tsx | Manage user pins |

---

## Modified Files

| File | Changes |
|------|---------|
| src/App.tsx | Add dynamic routes for categories and items |
| src/components/AppSidebar.tsx | Replace hardcoded items with DynamicSidebar |
| src/components/AppNavigationMenu.tsx | Replace hardcoded items with DynamicNavMenu |
| src/pages/Dashboard.tsx | Replace hardcoded cards with dynamic widgets |
| src/pages/admin/OrganizationSettings.tsx | Add Menu Configuration section |

---

## Route Structure

```text
/dashboard/:orgSlug                              → Dashboard (dynamic widgets)
/dashboard/:orgSlug/category/:categoryId         → DynamicCategoryPage
/dashboard/:orgSlug/item/:itemId                 → DynamicItemPage
/dashboard/:orgSlug/item/:itemId/:documentId     → Document Editor/Viewer
/dashboard/:orgSlug/admin/menu-config            → Menu Configuration (admin)
```

---

## Design Requirements

### Theme Compatibility
- Full light mode and dark mode support for all new components
- Use CSS variables and Tailwind theme tokens
- No hardcoded colors

### Color Accent System
- Integrate with organization accent_color setting
- Apply to active states, buttons, and highlights

### Logo Integration
- Support organization logos in navigation and dashboard
- Use existing useThemeLogos hook

### Consistent Styling
- Rounded corners: rounded-lg, rounded-xl
- Card styling: border-border, hover effects
- Match existing simplistic but professional aesthetic
- Uniform spacing and padding patterns

---

## Implementation Phases

### Phase 1: Database Foundation
- Create all 6 new tables with migrations
- Set up RLS policies using existing security functions
- Create any needed helper functions

### Phase 2: Icon System
- Build DynamicIcon component (40+ Lucide icons)
- Build IconPicker component for admin selection

### Phase 3: Menu Configuration Admin UI
- MenuCategoryEditor with CRUD operations
- MenuItemEditor for managing items
- AddMenuItemDialog with type selection
- Integration into Organization Settings page

### Phase 4: Dynamic Navigation
- DynamicSidebar replacing hardcoded module items
- DynamicNavMenu for mobile navigation
- Dynamic breadcrumbs for context

### Phase 5: Dynamic Pages
- DynamicCategoryPage showing menu items
- DynamicItemPage handling different item types
- File directory upload/view/search functionality
- Connect to existing ChecklistEditor, GembaDocEditor

### Phase 6: Pre-built Widgets
- RecentActivityWidget
- PinnedItemsWidget
- DocumentStatsWidget
- QuickLinksWidget
- ProgressWidget

### Phase 7: Dashboard Configuration
- WidgetGallery to browse widgets
- DashboardLayoutEditor for arrangement
- Widget add/remove/reorder functionality

### Phase 8: Widget Builder
- Custom widget creation interface
- Data source selection (category, documents, activity)
- Filter configuration
- Display type selection

### Phase 9: Activity Logging
- Implement activity_log inserts on CRUD operations
- Connect to RecentActivityWidget
- Filter and display logic

### Phase 10: Default Setup and Polish
- Seed default menu structure for new organizations
- Default widget configuration
- End-to-end testing
- Verify existing functionality preserved

---

## Default Organization Setup

New organizations receive this starting structure (fully modifiable):

**Default Categories:**
1. Shop & Install (icon: wrench)
   - Projects (tool: project_hub, unlimited)

2. SOP (icon: file-text)
   - Standard Operating Procedures (tool: sop_guide, unlimited)
   - Machine Operation (file_directory, searchable)
   - Machine Maintenance (file_directory, searchable)

**Default Widgets:**
1. Category Cards for Shop & Install and SOP
2. Recent Activity Feed
3. Pinned Items (empty, ready for user)

Organizations can delete, modify, or completely rebuild this structure.

