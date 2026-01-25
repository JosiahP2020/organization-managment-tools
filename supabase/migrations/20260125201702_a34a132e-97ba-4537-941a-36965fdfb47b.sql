-- Add display_mode column to checklists for numbered vs checkbox display
ALTER TABLE public.checklists 
ADD COLUMN display_mode TEXT NOT NULL DEFAULT 'checkbox' 
CHECK (display_mode IN ('checkbox', 'numbered'));