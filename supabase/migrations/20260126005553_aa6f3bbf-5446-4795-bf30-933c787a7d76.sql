-- Create projects table for Shop & Install
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects (same pattern as checklists)
CREATE POLICY "Users can view projects in their org" ON public.projects
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert projects" ON public.projects
  FOR INSERT WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update projects" ON public.projects
  FOR UPDATE USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete projects" ON public.projects
  FOR DELETE USING (is_org_admin(auth.uid(), organization_id));

-- Create trigger for updating updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add project_id column to checklists table for linking follow-up lists to projects
ALTER TABLE public.checklists ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;