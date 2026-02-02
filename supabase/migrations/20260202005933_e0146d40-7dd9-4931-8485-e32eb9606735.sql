-- Drop the old constraint and add updated one with follow_up_list
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_tool_type_check;

ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_tool_type_check 
CHECK (tool_type = ANY (ARRAY['checklist'::text, 'sop_guide'::text, 'project_hub'::text, 'follow_up_list'::text]));