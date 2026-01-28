-- Add dashboard customization columns to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS dashboard_layout text NOT NULL DEFAULT 'grid-right-column',
ADD COLUMN IF NOT EXISTS card_style text NOT NULL DEFAULT 'left-accent';

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.dashboard_layout IS 'Dashboard layout: full-width, grid-right-column, sidebar-left, masonry';
COMMENT ON COLUMN public.organizations.card_style IS 'Card style: left-accent, stat-card, clean-minimal';