-- Add accent_color column to organizations table
-- This stores the custom accent color as HSL values (e.g., "22 90% 54%")
ALTER TABLE public.organizations
ADD COLUMN accent_color text DEFAULT NULL;