-- Add follow_up_list to the document_category enum
ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'follow_up_list';