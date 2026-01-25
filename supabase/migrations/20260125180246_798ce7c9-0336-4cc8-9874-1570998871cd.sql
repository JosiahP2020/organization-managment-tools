-- Add logo_url column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN logo_url TEXT DEFAULT NULL;

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true);

-- RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- RLS policies for logos bucket (admin only upload, public view)
CREATE POLICY "Admins can upload org logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'logos' AND is_org_admin(auth.uid(), (storage.foldername(name))[1]::uuid));

CREATE POLICY "Admins can update org logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'logos' AND is_org_admin(auth.uid(), (storage.foldername(name))[1]::uuid));

CREATE POLICY "Admins can delete org logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'logos' AND is_org_admin(auth.uid(), (storage.foldername(name))[1]::uuid));

CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'logos');