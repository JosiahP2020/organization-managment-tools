ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_item_type_check;

ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_item_type_check
CHECK (item_type = ANY (ARRAY['submenu'::text, 'file_directory'::text, 'tool'::text, 'text_display'::text, 'section'::text]));