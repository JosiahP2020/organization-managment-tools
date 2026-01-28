-- Phase 1: Database Foundation for Customizable Navigation & Dashboard System

-- ============================================
-- Table: menu_categories
-- Stores top-level menus and nested submenus
-- ============================================
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'folder',
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  show_on_dashboard BOOLEAN NOT NULL DEFAULT true,
  show_in_sidebar BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_categories
CREATE POLICY "Users can view categories in their org"
ON public.menu_categories FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert categories"
ON public.menu_categories FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update categories"
ON public.menu_categories FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete categories"
ON public.menu_categories FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON public.menu_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Table: menu_items
-- Items within menus (file directories, tools, submenus)
-- ============================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'file',
  sort_order INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL CHECK (item_type IN ('submenu', 'file_directory', 'tool')),
  target_category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  is_searchable BOOLEAN NOT NULL DEFAULT true,
  tool_type TEXT CHECK (tool_type IN ('checklist', 'sop_guide', 'project_hub')),
  tool_mode TEXT NOT NULL DEFAULT 'unlimited' CHECK (tool_mode IN ('unlimited', 'single')),
  tool_is_searchable BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items
CREATE POLICY "Users can view items in their org"
ON public.menu_items FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert items"
ON public.menu_items FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update items"
ON public.menu_items FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete items"
ON public.menu_items FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Table: menu_item_documents
-- Documents uploaded to file directories or created by tools
-- ============================================
CREATE TABLE public.menu_item_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('file', 'checklist', 'sop_guide', 'project')),
  document_id UUID,
  title TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  created_by UUID NOT NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_item_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_item_documents
CREATE POLICY "Users can view documents in their org"
ON public.menu_item_documents FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert documents"
ON public.menu_item_documents FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update documents"
ON public.menu_item_documents FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete documents"
ON public.menu_item_documents FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_menu_item_documents_updated_at
BEFORE UPDATE ON public.menu_item_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Table: dashboard_widgets
-- Widgets displayed on organization dashboards
-- ============================================
CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('category_card', 'recent_activity', 'pinned_items', 'document_stats', 'quick_links', 'progress', 'custom')),
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  size TEXT NOT NULL DEFAULT 'normal' CHECK (size IN ('small', 'normal', 'large')),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_widgets
CREATE POLICY "Users can view widgets in their org"
ON public.dashboard_widgets FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert widgets"
ON public.dashboard_widgets FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update widgets"
ON public.dashboard_widgets FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete widgets"
ON public.dashboard_widgets FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_dashboard_widgets_updated_at
BEFORE UPDATE ON public.dashboard_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Table: pinned_items
-- User-specific pinned documents for quick access
-- ============================================
CREATE TABLE public.pinned_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('checklist', 'sop_guide', 'file', 'project')),
  document_id UUID NOT NULL,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, document_type, document_id)
);

-- Enable RLS
ALTER TABLE public.pinned_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pinned_items (users manage their own pins)
CREATE POLICY "Users can view their own pins"
ON public.pinned_items FOR SELECT
USING (user_id = auth.uid() AND organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can insert their own pins"
ON public.pinned_items FOR INSERT
WITH CHECK (user_id = auth.uid() AND organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can update their own pins"
ON public.pinned_items FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pins"
ON public.pinned_items FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- Table: activity_log
-- Tracks user actions for Recent Activity widget
-- ============================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'completed', 'viewed', 'deleted', 'archived')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('checklist', 'sop_guide', 'file', 'project', 'menu')),
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_log (read-only for org members, insert for authenticated users in org)
CREATE POLICY "Users can view activity in their org"
ON public.activity_log FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can insert activity in their org"
ON public.activity_log FOR INSERT
WITH CHECK (user_id = auth.uid() AND organization_id = get_user_organization(auth.uid()));

-- No UPDATE or DELETE policies - activity log is append-only

-- ============================================
-- Create indexes for performance
-- ============================================
CREATE INDEX idx_menu_categories_org ON public.menu_categories(organization_id);
CREATE INDEX idx_menu_categories_parent ON public.menu_categories(parent_category_id);
CREATE INDEX idx_menu_items_org ON public.menu_items(organization_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_menu_item_documents_org ON public.menu_item_documents(organization_id);
CREATE INDEX idx_menu_item_documents_menu_item ON public.menu_item_documents(menu_item_id);
CREATE INDEX idx_dashboard_widgets_org ON public.dashboard_widgets(organization_id);
CREATE INDEX idx_pinned_items_user ON public.pinned_items(user_id);
CREATE INDEX idx_pinned_items_org ON public.pinned_items(organization_id);
CREATE INDEX idx_activity_log_org ON public.activity_log(organization_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);