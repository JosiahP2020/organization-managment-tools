
# Plan: Add Tools Option to Menu Add Button

## Overview

This plan adds a "Tool" option to the plus button dropdown in the menu system. When clicked, it opens a dialog where admins can select from three tool types (Checklist, SOP Guide, Follow-up List) and configure the usage mode (Unlimited or Single-use). The tool will be created both as a document in the training system and linked as a menu item.

---

## What Gets Built

### User Experience Flow
1. Admin clicks the "+" button in a menu section
2. Dropdown now shows: **Submenu → File Directory → Tool → Section**
3. Admin clicks "Tool"
4. Dialog opens with:
   - Tool type selection (Checklist, SOP Guide, Follow-up List)
   - Title input field
   - Description input (optional)
   - Mode toggle: **Unlimited** (searchable list of documents) or **Single-use** (one specific document)
5. On create:
   - The underlying document is created (checklist or gemba_doc)
   - A menu item is created with `item_type: "tool"` and proper `tool_type`/`tool_mode`
   - The linkage is stored in `menu_item_documents` table
6. The tool appears as a card in the section with appropriate icon
7. Clicking the tool navigates to the appropriate editor

---

## Files to Create

### 1. `src/components/menu/AddToolDialog.tsx`
A dialog for creating new tools with:
- Radio/button group for tool type selection (Checklist, SOP Guide, Follow-up List)
- Title and description inputs
- Toggle for usage mode (Unlimited vs Single-use)
- Creates both the document and the menu item linkage

### 2. `src/components/menu/ToolCard.tsx`
Card component for displaying tools inline (similar pattern to FileDirectoryCard):
- Shows tool name with type-specific icon:
  - Checklist: `CheckSquare`
  - SOP Guide: `Grid3X3`
  - Follow-up List: `ListChecks`
- Admin controls (move up/down, delete, edit title)
- Clicking navigates to the tool editor

---

## Files to Modify

### 1. `src/components/menu/AddMenuItemButton.tsx`
- Add `Wrench` icon import
- Add `onAddTool` prop
- Add "Tool" dropdown item below "File Directory" with separator

### 2. `src/components/menu/MenuItemSection.tsx`
- Add `onAddTool` prop
- Pass `onAddTool` to `AddMenuItemButton`
- Render `ToolCard` for items with `item_type === "tool"`

### 3. `src/components/menu/MenuItemsColumn.tsx`
- Add state for tool dialog open/close
- Add handler for opening tool dialog with section context
- Add `createTool` mutation usage
- Render `AddToolDialog` component

### 4. `src/hooks/useMenuItems.tsx`
- Extend `MenuItem` interface to include `tool_type` and `tool_mode` fields
- Add `createTool` mutation that:
  1. Creates the document (checklist or gemba_doc) based on tool type
  2. Creates the menu_item with proper tool fields
  3. Creates the linkage in `menu_item_documents`
  4. Handles proper sort_order within the section

### 5. `src/pages/MenuDetail.tsx`
- Add navigation logic for tool items
- Route to appropriate editor based on tool_type

---

## Technical Details

### Database Tables Used (Already Exist)

**menu_items** (tool fields):
- `tool_type`: "checklist" | "sop_guide" | "follow_up_list"
- `tool_mode`: "unlimited" | "single"
- `tool_is_searchable`: boolean (default true)

**menu_item_documents** (linkage table):
- `menu_item_id`: references the tool menu item
- `document_id`: references the created checklist/gemba_doc
- `document_type`: "checklist" | "sop_guide"

### Icon Mapping

```text
Tool Type        Icon
-----------      -----------
Checklist        CheckSquare
SOP Guide        Grid3X3
Follow-up List   ListChecks
```

### Navigation Routes

```text
Tool Type        Route
-----------      ----------------------------------------
Checklist        /dashboard/{slug}/training/checklists/{id}
SOP Guide        /dashboard/{slug}/training/gemba/{id}
Follow-up List   /dashboard/{slug}/training/follow-up-list/{id}
```

### Tool Mode Behavior

- **Unlimited**: Creates a tool that can manage multiple documents. When clicked, shows a list view of all linked documents with ability to add more.
- **Single-use**: Creates a tool linked to exactly one document. When clicked, goes directly to that document's editor.

---

## Component Structure

```text
MenuItemsColumn
├── AddToolDialog (new)
├── MenuItemSection
│   ├── AddMenuItemButton (updated - adds Tool option)
│   ├── MenuItemCard (for submenus)
│   ├── FileDirectoryCard (for file directories)
│   └── ToolCard (new - for tools)
```

---

## Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `AddToolDialog.tsx` | Create | Dialog for tool type, title, mode selection |
| `ToolCard.tsx` | Create | Display card for tool items with navigation |
| `AddMenuItemButton.tsx` | Update | Add "Tool" option to dropdown |
| `MenuItemSection.tsx` | Update | Render ToolCard, pass onAddTool handler |
| `MenuItemsColumn.tsx` | Update | Manage tool dialog state, handle creation |
| `useMenuItems.tsx` | Update | Add createTool mutation, extend MenuItem type |
| `MenuDetail.tsx` | Update | Add navigation handler for tool clicks |

