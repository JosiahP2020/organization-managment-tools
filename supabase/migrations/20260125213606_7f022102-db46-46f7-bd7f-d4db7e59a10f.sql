-- Add dark mode logo columns to organizations table
ALTER TABLE public.organizations ADD COLUMN main_logo_dark_url text DEFAULT NULL;
ALTER TABLE public.organizations ADD COLUMN sub_logo_dark_url text DEFAULT NULL;