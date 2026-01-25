-- Change the default orientation for new gemba docs from 'portrait' to 'landscape'
ALTER TABLE public.gemba_docs ALTER COLUMN orientation SET DEFAULT 'landscape';