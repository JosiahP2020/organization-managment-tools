-- Add separate columns for main and sub logos
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS main_logo_url text,
ADD COLUMN IF NOT EXISTS sub_logo_url text;

-- Migrate existing logo_url data to main_logo_url
UPDATE public.organizations 
SET main_logo_url = logo_url 
WHERE logo_url IS NOT NULL AND main_logo_url IS NULL;