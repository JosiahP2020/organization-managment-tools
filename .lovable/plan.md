## Add "Text" Item Type to Menu

### Overview

Add a new "Text" option to the menu's plus button. When clicked, it shows a sub-menu with three choices: **Text**, **Address**, and **Lock Box Code**. Each creates a non-clickable display-only card in the menu with an appropriate icon and text.

### How It Works

1. **Plus button gets a 5th option**: "Text" with a `Type` icon
2. **Clicking "Text" opens a dialog** with three sub-options:
  - **Text** -- default icon (customizable via icon picker), user enters any text
  - **Address** -- icon auto-set to `map-pin`, user enters an address. Display always shows "Address: [address]"
  - **Lock Box Code** -- icon auto-set to `lock`, user enters the code. Display always shows "Lock Box Code: [code]"
3. **The created item appears as a non-clickable card** -- same visual style as a submenu card (icon + text) but no navigation on click

### Changes Required

#### 1. Database Migration

- Update the `menu_items_item_type_check` constraint to allow `'text_display'` as a new `item_type` value

#### 2. New Dialog: `AddTextDialog.tsx`

- Three radio/button options: Text, Address, Lock Box Code
- Based on selection:
  - **Text**: Shows icon picker (default icon: `type`) + text input for the display text
  - **Address**: Icon locked to `map-pin` + text input for address
  - **Lock Box Code**: Icon locked to `lock` + text input for the code
- Submits with `item_type: "text_display"` and a `description` field storing the sub-type (`text`, `address`, `lockbox`)

#### 3. New Component: `TextDisplayCard.tsx`

- Renders like a `MenuItemCard` visually (icon + text) but **not clickable** (no cursor pointer, no navigation)
- For Lock Box Code items, always displays as "Lock Box Code: [value]"
- Admin controls (edit, delete, reorder) still work

#### 4. Update `AddMenuItemButton.tsx`

- Add 5th dropdown option: "Text" with `Type` icon
- Add `onAddText` callback prop

#### 5. Update `MenuItemSection.tsx`

- Render `TextDisplayCard` for items with `item_type === "text_display"`
- Pass `onAddText` handler to `AddMenuItemButton`

#### 6. Update `MenuItemsColumn.tsx`

- Add state for `addTextDialogOpen`
- Add `handleAddText` and `handleCreateText` handlers
- Wire up the new `AddTextDialog`

#### 7. Update `useMenuItems.tsx`

- Add `createTextDisplay` mutation that inserts a `menu_item` with `item_type: "text_display"`, the chosen icon, and for lock box items, prefixes the name with "Lock Box Code: "

### Technical Details

- New `item_type` value: `text_display`
- The sub-type (text/address/lockbox) is stored in the `description` field for future reference
- Lock box items store just the code in the name field but render as "Lock Box Code: [code]"
- No `target_category_id` needed (non-navigable)
- The `TextDisplayCard` has `cursor-default` instead of `cursor-pointer` and no `onClick` handler for navigation
- Theme-compatible using existing card/border/foreground tokens