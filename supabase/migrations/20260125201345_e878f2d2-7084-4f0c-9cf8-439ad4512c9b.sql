-- Add item_type column to checklist_items to support checkbox vs dash items
ALTER TABLE public.checklist_items 
ADD COLUMN item_type TEXT NOT NULL DEFAULT 'checkbox' 
CHECK (item_type IN ('checkbox', 'dash'));