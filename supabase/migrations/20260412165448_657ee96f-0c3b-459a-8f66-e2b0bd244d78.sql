
CREATE TABLE public.pipe_drawer_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  measurement_id UUID NOT NULL REFERENCES public.pipe_drawer_measurements(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  mid TEXT,
  "left" TEXT,
  "right" TEXT,
  slides_length TEXT,
  drawer_height TEXT,
  drawer_label TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pipe_drawer_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries in their org"
  ON public.pipe_drawer_entries FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT public.get_user_organization(auth.uid())));

CREATE POLICY "Users can create entries in their org"
  ON public.pipe_drawer_entries FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT public.get_user_organization(auth.uid())));

CREATE POLICY "Users can update entries in their org"
  ON public.pipe_drawer_entries FOR UPDATE
  TO authenticated
  USING (organization_id = (SELECT public.get_user_organization(auth.uid())));

CREATE POLICY "Users can delete entries in their org"
  ON public.pipe_drawer_entries FOR DELETE
  TO authenticated
  USING (organization_id = (SELECT public.get_user_organization(auth.uid())));

CREATE INDEX idx_pipe_drawer_entries_measurement ON public.pipe_drawer_entries(measurement_id);
