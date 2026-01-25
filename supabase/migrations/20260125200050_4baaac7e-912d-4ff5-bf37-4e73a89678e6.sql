-- Add image_url column to checklist_sections for section images
ALTER TABLE public.checklist_sections 
ADD COLUMN image_url TEXT;