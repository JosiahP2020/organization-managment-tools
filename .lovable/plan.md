
# Customizable Navigation and Dashboard System

## Overview

This plan transforms the current hardcoded navigation structure (Shop & Install, SOP) into a fully dynamic, organization-configurable system. Admins will be able to:

- Create custom menu categories with custom names and icons
- Build hierarchical menu structures (menus within menus)
- Add searchable file directories as menu destinations
- Link existing tools (Checklists, SOP Guides, Projects) with custom display names
- Customize the dashboard to show their chosen categories

---

## Phase 1: Database Schema Design

### New Tables Required

**1. `menu_categories` - Top-level menu/dashboard items**
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- Display name (e.g., "Shop Floor")
  description TEXT,                       -- Optional description
  icon TEXT NOT NULL DEFAULT 'folder',    -- Lucide icon name
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_category_id UUID REFERENCES menu_categories(id), -- For nesting
  show_on_dashboard BOOLEAN DEFAULT true,
  show_in_sidebar BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**2. `menu_items` - Items within categories**
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- Display name
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'file',      -- Lucide icon name
  sort_order INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL,                -- 'subcategory', 'tool', 'file_directory'
  
  -- For 'tool' type - links to existing functionality
  tool_type TEXT,                         -- 'checklist', 'sop_guide', 'project_hub', 'pipe_measurements'
  tool_config JSONB DEFAULT '{}',         -- Additional tool settings
  
  -- For 'file_directory' type - searchable document list
  directory_document_category TEXT,       -- Links to existing document_category enum
  
  -- For 'subcategory' type - creates a nested menu
  target_category_id UUID REFERENCES menu_categories(id),
  
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**3. `dashboard_widgets` - Customizable dashboard layout**
```sql
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id),  -- Which category to display
  position INTEGER NOT NULL DEFAULT 0,              -- Order on dashboard
  size TEXT DEFAULT 'normal',                       -- 'small', 'normal', 'large'
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, category_id)
);
```

### RLS Policies
- All tables will have organization-scoped RLS
- Only admins can insert/update/delete
- All org users can view (SELECT)

---

## Phase 2: Available Tool Types

The system will support these linkable tool types:

| Tool Type | Description | Current Implementation |
|-----------|-------------|------------------------|
| `checklist` | Interactive checklist with sections/items | ChecklistEditor.tsx |
| `sop_guide` | Grid-based SOP documentation | GembaDocEditor.tsx |
| `project_hub` | Project detail with follow-up lists | ProjectDetail.tsx |
| `pipe_measurements` | Pipe drawer measurement tool | Coming soon |
| `file_directory` | Searchable list of documents | CategoryDocuments.tsx |

Each tool can be given a custom name by the organization.

---

## Phase 3: Icon System

### Available Icons
Store icon names as strings and render dynamically using a mapping system:

```typescript
const iconMap: Record<string, LucideIcon> = {
  folder: Folder,
  file: FileText,
  wrench: Wrench,
  cog: Cog,
  clipboard: ClipboardList,
  grid: Grid3X3,
  ruler: Ruler,
  users: Users,
  home: Home,
  // ... 30+ commonly used icons
};
```

The admin UI will show an icon picker with visual previews.

---

## Phase 4: Menu Configuration UI

### Admin Interface Location
Add a new section in **Organization Settings** (`/admin/organization`):

**"Menu & Dashboard Configuration"** section with:

1. **Category Manager**
   - List of all custom categories
   - Add/Edit/Delete/Reorder categories
   - Set icon, name, description
   - Toggle dashboard/sidebar visibility

2. **Item Manager** (per category)
   - Add items to category
   - Choose item type: Subcategory | Tool | File Directory
   - Configure tool settings (which tool, custom name)
   - Reorder items with drag-and-drop

3. **Dashboard Layout**
   - Visual grid showing current dashboard widgets
   - Enable/disable categories on dashboard
   - Reorder dashboard cards

### UI Components to Create
- `MenuCategoryEditor.tsx` - Manage categories
- `MenuItemEditor.tsx` - Manage items within a category
- `IconPicker.tsx` - Visual icon selection
- `DashboardLayoutEditor.tsx` - Dashboard customization

---

## Phase 5: Dynamic Navigation Rendering

### Updates to AppSidebar.tsx
Replace hardcoded module items with dynamic query:

```typescript
// Fetch custom menu categories
const { data: menuCategories } = useQuery({
  queryKey: ["menu-categories", organization?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("show_in_sidebar", true)
      .order("sort_order");
    return data;
  }
});

// Render dynamically
{menuCategories?.map((category) => (
  <SidebarMenuItem key={category.id}>
    <NavLink to={`${basePath}/category/${category.id}`}>
      <DynamicIcon name={category.icon} />
      {category.name}
    </NavLink>
  </SidebarMenuItem>
))}
```

### Updates to AppNavigationMenu.tsx
Same dynamic rendering for mobile menu.

---

## Phase 6: Dynamic Dashboard Rendering

### Updates to Dashboard.tsx
Replace hardcoded CategoryCards with dynamic widgets:

```typescript
// Fetch dashboard widgets with their categories
const { data: dashboardWidgets } = useQuery({
  queryKey: ["dashboard-widgets", organization?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from("dashboard_widgets")
      .select(`
        *,
        category:menu_categories(*)
      `)
      .eq("organization_id", organization.id)
      .eq("is_visible", true)
      .order("position");
    return data;
  }
});

// Render dynamic category cards
{dashboardWidgets?.map((widget) => (
  <CategoryCard
    key={widget.id}
    icon={<DynamicIcon name={widget.category.icon} />}
    title={widget.category.name}
    description={widget.category.description}
    onClick={() => navigate(`/category/${widget.category.id}`)}
  />
))}
```

---

## Phase 7: Dynamic Category Pages

### New Generic Route
Add to App.tsx:
```typescript
<Route 
  path="/dashboard/:orgSlug/category/:categoryId" 
  element={<DynamicCategoryPage />} 
/>
<Route 
  path="/dashboard/:orgSlug/category/:categoryId/:itemId" 
  element={<DynamicItemPage />} 
/>
```

### DynamicCategoryPage.tsx
A new page that:
1. Fetches the category and its items
2. Renders items based on their type:
   - **Subcategory**: Links to another category page
   - **Tool**: Links to the appropriate tool page (checklist, SOP guide, etc.)
   - **File Directory**: Shows searchable document list (reuses CategoryDocuments logic)

### DynamicItemPage.tsx
Routes to the appropriate editor based on tool type:
- Checklist → ChecklistEditor
- SOP Guide → GembaDocEditor
- Project Hub → ProjectDetail
- etc.

---

## Phase 8: Migration Path for Existing Data

### Default Menu Structure
On first load (or for new organizations), seed default categories:

```sql
-- Create default "Shop & Install" category
INSERT INTO menu_categories (organization_id, name, icon, sort_order)
VALUES (org_id, 'Shop & Install', 'wrench', 1);

-- Create default "SOP" category  
INSERT INTO menu_categories (organization_id, name, icon, sort_order)
VALUES (org_id, 'SOP', 'file-text', 2);

-- Add items to SOP category
INSERT INTO menu_items (category_id, name, icon, item_type, directory_document_category)
VALUES 
  (sop_category_id, 'SOP', 'file-text', 'file_directory', 'sop_training'),
  (sop_category_id, 'Machine Operation', 'cog', 'file_directory', 'machine_operation'),
  (sop_category_id, 'Machine Maintenance', 'wrench', 'file_directory', 'machine_maintenance');
```

---

## Phase 9: File Structure Summary

### New Files to Create

```
src/
├── components/
│   ├── menu-config/
│   │   ├── MenuCategoryEditor.tsx      # Admin UI for categories
│   │   ├── MenuItemEditor.tsx          # Admin UI for items
│   │   ├── IconPicker.tsx              # Icon selection component
│   │   ├── DashboardLayoutEditor.tsx   # Dashboard customization
│   │   └── DynamicIcon.tsx             # Renders icons by name
│   └── navigation/
│       ├── DynamicSidebar.tsx          # Replaces hardcoded sidebar
│       └── DynamicNavMenu.tsx          # Replaces hardcoded mobile menu
├── pages/
│   ├── category/
│   │   ├── DynamicCategoryPage.tsx     # Generic category view
│   │   └── DynamicItemPage.tsx         # Routes to appropriate tool
│   └── admin/
│       └── MenuConfiguration.tsx       # Admin menu setup page
└── hooks/
    └── useMenuConfiguration.tsx        # Shared menu data hooks
```

### Files to Modify
- `src/App.tsx` - Add new dynamic routes
- `src/components/AppSidebar.tsx` - Use dynamic menu data
- `src/components/AppNavigationMenu.tsx` - Use dynamic menu data
- `src/pages/Dashboard.tsx` - Use dynamic dashboard widgets
- `src/pages/admin/OrganizationSettings.tsx` - Add menu configuration section

---

## Implementation Order

1. **Database First**: Create tables with migrations and RLS policies
2. **Icon System**: Build DynamicIcon component and icon picker
3. **Admin UI**: Build menu configuration interface
4. **Dynamic Navigation**: Update sidebar and mobile menu
5. **Dynamic Dashboard**: Update dashboard to use widgets
6. **Dynamic Pages**: Create generic category/item pages
7. **Migration**: Seed default data for existing organizations
8. **Testing**: Verify all existing functionality still works

---

## Technical Notes

- **Icon Storage**: Store Lucide icon names as strings (e.g., "wrench", "file-text")
- **Backwards Compatibility**: Keep existing routes working during transition
- **Performance**: Use React Query caching for menu data
- **Validation**: Ensure at least one dashboard item exists
- **Mobile**: All admin UIs will be responsive

---

## Example User Flow

1. Admin goes to Organization Settings → Menu Configuration
2. Creates new category "Production Floor" with wrench icon
3. Adds items:
   - "Daily Checklists" → Tool: Checklist
   - "Machine Guides" → Tool: SOP Guide
   - "Work Orders" → Subcategory (links to another category)
4. Enables "Production Floor" on dashboard
5. All users now see "Production Floor" in sidebar and dashboard
6. Clicking opens category with configured items

