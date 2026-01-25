-- Add archived_at column to checklists table for archive functionality
ALTER TABLE public.checklists 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;