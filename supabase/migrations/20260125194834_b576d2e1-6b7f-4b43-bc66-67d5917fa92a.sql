-- Checklists table (main document)
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category public.document_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Checklist sections (groupings like "Oil", "Safety")
CREATE TABLE public.checklist_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Checklist items (with nested sub-items support via parent_item_id)
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.checklist_sections(id) ON DELETE CASCADE,
  parent_item_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at on checklists
CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- RLS POLICIES: checklists
-- =====================

-- All org members can view checklists in their org
CREATE POLICY "Users can view checklists in their org"
  ON public.checklists
  FOR SELECT
  USING (organization_id = public.get_user_organization(auth.uid()));

-- Admins can insert checklists in their org
CREATE POLICY "Admins can insert checklists"
  ON public.checklists
  FOR INSERT
  WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

-- Admins can update checklists in their org
CREATE POLICY "Admins can update checklists"
  ON public.checklists
  FOR UPDATE
  USING (public.is_org_admin(auth.uid(), organization_id));

-- Admins can delete checklists in their org
CREATE POLICY "Admins can delete checklists"
  ON public.checklists
  FOR DELETE
  USING (public.is_org_admin(auth.uid(), organization_id));

-- =====================
-- RLS POLICIES: checklist_sections
-- =====================

-- Users can view sections if they can view the parent checklist
CREATE POLICY "Users can view sections in their org"
  ON public.checklist_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists c
      WHERE c.id = checklist_id
      AND c.organization_id = public.get_user_organization(auth.uid())
    )
  );

-- Admins can insert sections
CREATE POLICY "Admins can insert sections"
  ON public.checklist_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists c
      WHERE c.id = checklist_id
      AND public.is_org_admin(auth.uid(), c.organization_id)
    )
  );

-- Admins can update sections
CREATE POLICY "Admins can update sections"
  ON public.checklist_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists c
      WHERE c.id = checklist_id
      AND public.is_org_admin(auth.uid(), c.organization_id)
    )
  );

-- Admins can delete sections
CREATE POLICY "Admins can delete sections"
  ON public.checklist_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists c
      WHERE c.id = checklist_id
      AND public.is_org_admin(auth.uid(), c.organization_id)
    )
  );

-- =====================
-- RLS POLICIES: checklist_items
-- =====================

-- Users can view items if they can view the parent section/checklist
CREATE POLICY "Users can view items in their org"
  ON public.checklist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.checklist_sections s
      JOIN public.checklists c ON c.id = s.checklist_id
      WHERE s.id = section_id
      AND c.organization_id = public.get_user_organization(auth.uid())
    )
  );

-- Admins can insert items
CREATE POLICY "Admins can insert items"
  ON public.checklist_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklist_sections s
      JOIN public.checklists c ON c.id = s.checklist_id
      WHERE s.id = section_id
      AND public.is_org_admin(auth.uid(), c.organization_id)
    )
  );

-- Admins can update items
CREATE POLICY "Admins can update items"
  ON public.checklist_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklist_sections s
      JOIN public.checklists c ON c.id = s.checklist_id
      WHERE s.id = section_id
      AND public.is_org_admin(auth.uid(), c.organization_id)
    )
  );

-- Admins can delete items
CREATE POLICY "Admins can delete items"
  ON public.checklist_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklist_sections s
      JOIN public.checklists c ON c.id = s.checklist_id
      WHERE s.id = section_id
      AND public.is_org_admin(auth.uid(), c.organization_id)
    )
  );