-- Add display_name column for friendly organization name display
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS display_name text;

-- Update existing rows to use name as display_name if not set
UPDATE public.organizations 
SET display_name = name 
WHERE display_name IS NULL;