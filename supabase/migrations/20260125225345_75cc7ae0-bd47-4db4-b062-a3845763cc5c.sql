-- Create gemba_docs table for visual training manuals
CREATE TABLE public.gemba_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category public.document_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  orientation TEXT NOT NULL DEFAULT 'portrait',
  grid_columns INTEGER NOT NULL DEFAULT 2,
  grid_rows INTEGER NOT NULL DEFAULT 2,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Create gemba_doc_pages table for multi-page support
CREATE TABLE public.gemba_doc_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gemba_doc_id UUID NOT NULL REFERENCES public.gemba_docs(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gemba_doc_id, page_number)
);

-- Create gemba_doc_cells table for grid cell content
CREATE TABLE public.gemba_doc_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.gemba_doc_pages(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  image_url TEXT,
  image_annotations JSONB DEFAULT '[]'::jsonb,
  step_number TEXT,
  step_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, position)
);

-- Enable RLS on all tables
ALTER TABLE public.gemba_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemba_doc_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemba_doc_cells ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gemba_docs
CREATE POLICY "Users can view gemba docs in their org"
ON public.gemba_docs
FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert gemba docs"
ON public.gemba_docs
FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update gemba docs"
ON public.gemba_docs
FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete gemba docs"
ON public.gemba_docs
FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- RLS Policies for gemba_doc_pages
CREATE POLICY "Users can view pages in their org"
ON public.gemba_doc_pages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM gemba_docs g
  WHERE g.id = gemba_doc_pages.gemba_doc_id
  AND g.organization_id = get_user_organization(auth.uid())
));

CREATE POLICY "Admins can insert pages"
ON public.gemba_doc_pages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM gemba_docs g
  WHERE g.id = gemba_doc_pages.gemba_doc_id
  AND is_org_admin(auth.uid(), g.organization_id)
));

CREATE POLICY "Admins can update pages"
ON public.gemba_doc_pages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM gemba_docs g
  WHERE g.id = gemba_doc_pages.gemba_doc_id
  AND is_org_admin(auth.uid(), g.organization_id)
));

CREATE POLICY "Admins can delete pages"
ON public.gemba_doc_pages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM gemba_docs g
  WHERE g.id = gemba_doc_pages.gemba_doc_id
  AND is_org_admin(auth.uid(), g.organization_id)
));

-- RLS Policies for gemba_doc_cells
CREATE POLICY "Users can view cells in their org"
ON public.gemba_doc_cells
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM gemba_doc_pages p
  JOIN gemba_docs g ON g.id = p.gemba_doc_id
  WHERE p.id = gemba_doc_cells.page_id
  AND g.organization_id = get_user_organization(auth.uid())
));

CREATE POLICY "Admins can insert cells"
ON public.gemba_doc_cells
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM gemba_doc_pages p
  JOIN gemba_docs g ON g.id = p.gemba_doc_id
  WHERE p.id = gemba_doc_cells.page_id
  AND is_org_admin(auth.uid(), g.organization_id)
));

CREATE POLICY "Admins can update cells"
ON public.gemba_doc_cells
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM gemba_doc_pages p
  JOIN gemba_docs g ON g.id = p.gemba_doc_id
  WHERE p.id = gemba_doc_cells.page_id
  AND is_org_admin(auth.uid(), g.organization_id)
));

CREATE POLICY "Admins can delete cells"
ON public.gemba_doc_cells
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM gemba_doc_pages p
  JOIN gemba_docs g ON g.id = p.gemba_doc_id
  WHERE p.id = gemba_doc_cells.page_id
  AND is_org_admin(auth.uid(), g.organization_id)
));

-- Create updated_at trigger for gemba_docs
CREATE TRIGGER update_gemba_docs_updated_at
BEFORE UPDATE ON public.gemba_docs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();