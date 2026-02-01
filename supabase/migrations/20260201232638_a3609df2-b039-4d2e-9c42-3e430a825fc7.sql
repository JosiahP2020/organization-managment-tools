-- Drop the old constraint and add a new one that includes 'section'
ALTER TABLE public.menu_items DROP CONSTRAINT menu_items_item_type_check;

ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_item_type_check 
CHECK (item_type = ANY (ARRAY['submenu'::text, 'file_directory'::text, 'tool'::text, 'section'::text]));