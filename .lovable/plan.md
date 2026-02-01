
# Plan: Dashboard Menu Sections

## Overview
Add the ability to organize menu cards on the dashboard into titled sections. Admins will be able to add new sections via the existing "+" dropdown, and each section will have an editable title with its own set of menu cards.

## Current State
- Menu cards (categories) are displayed in a flat grid on the dashboard
- The "+" button opens a dropdown with only "Menu" option
- No concept of sections exists for dashboard organization

## Database Changes

### New Table: `dashboard_sections`
Create a new table to store section information:

| Column | Type | Details |
|--------|------|---------|
| id | uuid | Primary key, auto-generated |
| organization_id | uuid | Foreign key to organizations |
| title | text | Section title (editable) |
| sort_order | integer | For ordering sections, default 0 |
| created_by | uuid | User who created the section |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

### Update `menu_categories` Table
Add a `section_id` column to link categories to sections:

| Column | Type | Details |
|--------|------|---------|
| section_id | uuid (nullable) | Foreign key to dashboard_sections |

### Row Level Security
- Same pattern as other admin-managed tables
- Admins can CRUD sections in their organization
- All users can view sections in their organization

### Default Section Migration
- When a user first adds a section, create a "Default" section and migrate existing categories to it
- Or handle gracefully by showing categories with `section_id = null` in an "untitled" section

## Frontend Changes

### 1. Update AddMenuCardButton.tsx
Add "Section" option to the dropdown menu:
- Icon: `LayoutList` or `Rows` from lucide-react
- Label: "Section"
- Triggers a simple dialog or inline creation

### 2. Create AddSectionDialog.tsx
Simple dialog for creating a new section:
- Title input field (required)
- Creates section with next sort_order

### 3. Create DashboardSection.tsx Component
New component to render a section with:
- Editable title (click to edit, like ChecklistSection)
- Grid of menu cards belonging to that section
- "+" button at the end of the section's grid
- Reorder buttons (up/down arrows) for admin

### 4. Update DashboardCategoryGrid.tsx
Major refactor to render sections:
- Fetch sections with their categories
- For each section, render title + category grid
- Show "Add Section" button at the bottom
- Handle the case where no sections exist (show categories directly or create default section)

### 5. Update useDashboardCategories.tsx
Modify to include section information:
- Join with `dashboard_sections` table
- Group categories by section_id
- Return both sections and their categories

## UI/UX Flow

```
+------------------------------------------+
| Section Title (editable)           [^ v] |
+------------------------------------------+
| [Card 1] [Card 2] [Card 3] [+]           |
+------------------------------------------+

+------------------------------------------+
| Another Section               [^ v] [x]  |
+------------------------------------------+
| [Card 4] [Card 5] [+]                    |
+------------------------------------------+

[+ Add Section]
```

### Section Title Behavior
- Click on title to edit (input field appears)
- Press Enter or blur to save
- Escape to cancel editing
- First section created automatically when user adds their first menu (with title "Main" or custom)

### Categories Without Sections
- Existing categories (with `section_id = null`) display in an "Unsorted" section at the top
- Or migrate them to a default section automatically

## Files to Create
1. `src/components/dashboard/AddSectionDialog.tsx` - Dialog for creating sections
2. `src/components/dashboard/DashboardSection.tsx` - Section component with title and category grid

## Files to Modify
1. `src/components/dashboard/AddMenuCardButton.tsx` - Add "Section" option
2. `src/components/dashboard/AddMenuCardDialog.tsx` - Accept optional section_id prop
3. `src/components/dashboard/DashboardCategoryGrid.tsx` - Render sections with categories
4. `src/hooks/useDashboardCategories.tsx` - Fetch sections and join with categories

## Technical Details

### Hook: useDashboardSections
New hook to fetch sections with their categories:
```typescript
const { sections, isLoading } = useDashboardSections();
// sections: [{ id, title, sort_order, categories: [...] }]
```

### Section State Management
- Use React Query for data fetching and caching
- Invalidate queries on create/update/delete operations

### Theme Compatibility
- Section title uses `text-foreground` for theme compatibility
- Borders and backgrounds use `border-border` and `bg-card/bg-muted` classes

### Organization Logos/Accents
- Section styling uses organization accent color where appropriate (optional)
- No new logo placements needed

### Sidebar Integration
- Sections are dashboard-only; sidebar menu remains flat
- No changes to SidebarMenu component needed

## Migration Strategy
1. Create `dashboard_sections` table
2. Add `section_id` column to `menu_categories`
3. Existing categories remain with `section_id = null`
4. UI shows null-section categories in a default "Main" section (or unnamed)
5. When admin creates first section, they can optionally move existing cards into it
