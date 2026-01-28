-- Add section_id column to menu_items for Section Categories feature
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL;

-- Add index for performance when querying items by section
CREATE INDEX IF NOT EXISTS idx_menu_items_section_id ON public.menu_items(section_id);