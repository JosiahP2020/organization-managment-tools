-- Drop the overly permissive storage policies
DROP POLICY IF EXISTS "Users can view training documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload training documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update training documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete training documents" ON storage.objects;

-- Create proper storage policies with organization-based access
-- Users can view files in their organization's folder
CREATE POLICY "Users can view org training documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'training-documents' 
  AND (storage.foldername(name))[1] = get_user_organization(auth.uid())::text
);

-- Admins can upload files to their organization's folder
CREATE POLICY "Admins can upload org training documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'training-documents' 
  AND (storage.foldername(name))[1] = get_user_organization(auth.uid())::text
  AND has_role(auth.uid(), 'admin')
);

-- Admins can update files in their organization's folder  
CREATE POLICY "Admins can update org training documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'training-documents' 
  AND (storage.foldername(name))[1] = get_user_organization(auth.uid())::text
  AND has_role(auth.uid(), 'admin')
);

-- Admins can delete files in their organization's folder
CREATE POLICY "Admins can delete org training documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'training-documents' 
  AND (storage.foldername(name))[1] = get_user_organization(auth.uid())::text
  AND has_role(auth.uid(), 'admin')
);