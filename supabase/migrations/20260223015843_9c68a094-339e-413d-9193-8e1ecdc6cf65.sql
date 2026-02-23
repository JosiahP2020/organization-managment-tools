
-- Table to track which app items have been exported to Google Drive
CREATE TABLE public.drive_file_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  entity_type TEXT NOT NULL, -- 'checklist', 'gemba_doc', 'file_directory_file', 'text_display'
  entity_id UUID NOT NULL,
  drive_file_id TEXT NOT NULL,
  drive_folder_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one Drive reference per entity per org
CREATE UNIQUE INDEX idx_drive_file_refs_unique ON public.drive_file_references (organization_id, entity_type, entity_id);

-- Index for lookups by entity
CREATE INDEX idx_drive_file_refs_entity ON public.drive_file_references (entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.drive_file_references ENABLE ROW LEVEL SECURITY;

-- Admins can manage drive references in their org
CREATE POLICY "Admins can view drive refs"
  ON public.drive_file_references FOR SELECT
  USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can insert drive refs"
  ON public.drive_file_references FOR INSERT
  WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update drive refs"
  ON public.drive_file_references FOR UPDATE
  USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete drive refs"
  ON public.drive_file_references FOR DELETE
  USING (is_org_admin(auth.uid(), organization_id));

-- Also allow regular users to view (so they can see the Drive badge)
CREATE POLICY "Users can view drive refs in their org"
  ON public.drive_file_references FOR SELECT
  USING (organization_id = get_user_organization(auth.uid()));
