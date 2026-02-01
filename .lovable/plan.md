
# Plan: Cross-Section Menu Card Dragging

## Overview
Enable dragging menu cards between different sections on the dashboard. Currently, cards can only be reordered within their own section. This enhancement will allow admins to move cards from one section to another via drag-and-drop.

## Current Limitation
Each section has its own isolated drag-and-drop context (`DndContext`), which prevents cards from being dragged across section boundaries.

## Solution Approach
Lift the card-level drag-and-drop context to the parent component so all cards across all sections share a single context. This enables detecting when a card is dropped into a different section.

---

## Database Changes
No schema changes required. The `menu_categories` table already has a `section_id` column that can be updated when a card moves between sections.

---

## Frontend Changes

### 1. Update `useDashboardSections.tsx`
Add a new mutation to move a category to a different section:

| Mutation | Purpose |
|----------|---------|
| `moveCategory` | Updates a category's `section_id` and `sort_order` when dropped into a new section |

### 2. Refactor `DashboardCategoryGrid.tsx`
Create a unified drag-and-drop context for all cards:
- Add a single `DndContext` that wraps all sections for card dragging
- Handle the `onDragEnd` event to detect cross-section moves
- When a card is dropped on a card in a different section, update its `section_id`
- Use droppable areas for each section to detect drops

### 3. Update `SortableSection.tsx`
Remove the internal `DndContext` for cards:
- Keep the section as a sortable item (for section reordering)
- Remove the nested `DndContext` since cards will use the parent context
- Make the section a droppable zone using `useDroppable`
- Pass through the card rendering without its own drag context

### 4. Update `SortableMenuCard.tsx`
Enhance with section awareness:
- Add `sectionId` prop to track which section the card belongs to
- The card's sortable ID will encode both card ID and section ID for detection

---

## Technical Approach

### Drag Detection Strategy
Use `@dnd-kit`'s collision detection to determine:
1. **Same section reorder**: When `active.id` and `over.id` belong to the same section - reorder within section
2. **Cross-section move**: When `active.id` and `over.id` belong to different sections - move card to target section

### Data Structure for Sortable Items
Encode section information in the sortable item data:
```typescript
// Each sortable card will have data like:
{
  id: categoryId,
  data: { 
    sectionId: "section-uuid",
    type: "card" 
  }
}
```

### Drop Handling Logic
```text
On drag end:
  1. Get source section ID from active item's data
  2. Get target section ID from over item's data (or droppable zone)
  3. If same section: reorder cards within section
  4. If different section: 
     - Call moveCategory mutation with new section_id
     - Calculate new sort_order based on drop position
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDashboardSections.tsx` | Add `moveCategory` mutation |
| `src/components/dashboard/DashboardCategoryGrid.tsx` | Unified DndContext for all cards, cross-section drop handling |
| `src/components/dashboard/SortableSection.tsx` | Remove nested DndContext, add useDroppable for section zone |
| `src/components/dashboard/SortableMenuCard.tsx` | Add sectionId prop for tracking |

---

## User Experience
- Drag a card from one section
- Drop it onto a card in another section (inserts before/after that card)
- Or drop it into an empty section area
- Visual feedback shows which section will receive the card
- Card animates to its new position
- Toast confirmation shows the move was successful
