-- Create enum for document categories
CREATE TYPE document_category AS ENUM ('machine_operation', 'machine_maintenance', 'sop_training');

-- Create table for training documents
CREATE TABLE public.training_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category document_category NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents in their organization
CREATE POLICY "Users can view documents in their org"
ON public.training_documents
FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

-- Policy: Admins can insert documents in their org
CREATE POLICY "Admins can insert documents in their org"
ON public.training_documents
FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

-- Policy: Admins can update documents in their org
CREATE POLICY "Admins can update documents in their org"
ON public.training_documents
FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

-- Policy: Admins can delete documents in their org
CREATE POLICY "Admins can delete documents in their org"
ON public.training_documents
FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Create trigger for updated_at
CREATE TRIGGER update_training_documents_updated_at
BEFORE UPDATE ON public.training_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for training documents
INSERT INTO storage.buckets (id, name, public) VALUES ('training-documents', 'training-documents', true);

-- Storage policies for training documents bucket
CREATE POLICY "Users can view training documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-documents');

CREATE POLICY "Admins can upload training documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'training-documents');

CREATE POLICY "Admins can update training documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'training-documents');

CREATE POLICY "Admins can delete training documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'training-documents');