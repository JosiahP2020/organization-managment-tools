-- Create table for file directory files
CREATE TABLE public.file_directory_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_file_directory_files_menu_item ON public.file_directory_files(menu_item_id);
CREATE INDEX idx_file_directory_files_org ON public.file_directory_files(organization_id);

-- Enable RLS
ALTER TABLE public.file_directory_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view files in their org"
ON public.file_directory_files
FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can insert files"
ON public.file_directory_files
FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update files"
ON public.file_directory_files
FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete files"
ON public.file_directory_files
FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Create storage bucket for file directory uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('file-directory', 'file-directory', true);

-- Storage policies for file-directory bucket
CREATE POLICY "Anyone can view file directory files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'file-directory');

CREATE POLICY "Authenticated users can upload file directory files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'file-directory' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their file directory files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'file-directory' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete file directory files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'file-directory' AND auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_file_directory_files_updated_at
BEFORE UPDATE ON public.file_directory_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();