-- Add images array column to store multiple images per section
ALTER TABLE public.checklist_sections 
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to the new images array
UPDATE public.checklist_sections 
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL;