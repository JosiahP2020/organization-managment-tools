
-- Table to store organization-level integrations (Google Drive OAuth tokens, etc.)
CREATE TABLE public.organization_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google_drive',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  root_folder_id TEXT,
  root_folder_name TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, provider)
);

-- Enable RLS
ALTER TABLE public.organization_integrations ENABLE ROW LEVEL SECURITY;

-- Only org admins can view integrations
CREATE POLICY "Admins can view integrations"
  ON public.organization_integrations
  FOR SELECT
  USING (is_org_admin(auth.uid(), organization_id));

-- Only org admins can insert integrations
CREATE POLICY "Admins can insert integrations"
  ON public.organization_integrations
  FOR INSERT
  WITH CHECK (is_org_admin(auth.uid(), organization_id));

-- Only org admins can update integrations
CREATE POLICY "Admins can update integrations"
  ON public.organization_integrations
  FOR UPDATE
  USING (is_org_admin(auth.uid(), organization_id));

-- Only org admins can delete integrations
CREATE POLICY "Admins can delete integrations"
  ON public.organization_integrations
  FOR DELETE
  USING (is_org_admin(auth.uid(), organization_id));

-- Auto-update updated_at
CREATE TRIGGER update_organization_integrations_updated_at
  BEFORE UPDATE ON public.organization_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
