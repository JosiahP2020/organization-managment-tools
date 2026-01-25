-- Add display_mode column to checklist_sections for per-section control
ALTER TABLE public.checklist_sections 
ADD COLUMN display_mode TEXT NOT NULL DEFAULT 'checkbox' 
CHECK (display_mode IN ('checkbox', 'numbered'));

-- Create storage policies for training-documents bucket to allow authenticated uploads
CREATE POLICY "Authenticated users can upload to training-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'training-documents');

CREATE POLICY "Authenticated users can update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'training-documents');

CREATE POLICY "Authenticated users can delete from training-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'training-documents');