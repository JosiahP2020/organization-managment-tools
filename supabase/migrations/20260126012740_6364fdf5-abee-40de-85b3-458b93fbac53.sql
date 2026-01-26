-- Create table for pipe drawer measurements
CREATE TABLE public.pipe_drawer_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pipe_drawer_measurements ENABLE ROW LEVEL SECURITY;

-- Users can view measurements in their org
CREATE POLICY "Users can view measurements in their org" 
ON public.pipe_drawer_measurements 
FOR SELECT 
USING (organization_id = get_user_organization(auth.uid()));

-- Admins can insert measurements
CREATE POLICY "Admins can insert measurements" 
ON public.pipe_drawer_measurements 
FOR INSERT 
WITH CHECK (is_org_admin(auth.uid(), organization_id));

-- Admins can update measurements
CREATE POLICY "Admins can update measurements" 
ON public.pipe_drawer_measurements 
FOR UPDATE 
USING (is_org_admin(auth.uid(), organization_id));

-- Admins can delete measurements
CREATE POLICY "Admins can delete measurements" 
ON public.pipe_drawer_measurements 
FOR DELETE 
USING (is_org_admin(auth.uid(), organization_id));

-- Add trigger for updated_at
CREATE TRIGGER update_pipe_drawer_measurements_updated_at
BEFORE UPDATE ON public.pipe_drawer_measurements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();