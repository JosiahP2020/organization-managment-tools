
-- Update the check constraint on menu_items to allow 'text_display' item_type
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_item_type_check;
ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_item_type_check 
  CHECK (item_type IN ('submenu', 'file_directory', 'tool', 'text_display'));
