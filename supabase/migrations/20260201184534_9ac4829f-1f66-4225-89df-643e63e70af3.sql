-- Create dashboard_sections table
CREATE TABLE public.dashboard_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add section_id to menu_categories
ALTER TABLE public.menu_categories
ADD COLUMN section_id UUID REFERENCES public.dashboard_sections(id) ON DELETE SET NULL;

-- Enable RLS on dashboard_sections
ALTER TABLE public.dashboard_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_sections
CREATE POLICY "Admins can insert sections"
ON public.dashboard_sections
FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update sections"
ON public.dashboard_sections
FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete sections"
ON public.dashboard_sections
FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Users can view sections in their org"
ON public.dashboard_sections
FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_dashboard_sections_updated_at
BEFORE UPDATE ON public.dashboard_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();