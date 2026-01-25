-- Add JSONB columns to store SVG color mappings for logos
ALTER TABLE public.organizations 
ADD COLUMN main_logo_colors jsonb DEFAULT '{}'::jsonb,
ADD COLUMN sub_logo_colors jsonb DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.organizations.main_logo_colors IS 'JSON mapping of original colors to replacement colors for main SVG logo';
COMMENT ON COLUMN public.organizations.sub_logo_colors IS 'JSON mapping of original colors to replacement colors for sub SVG logo';