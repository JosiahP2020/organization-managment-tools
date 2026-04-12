ALTER TABLE public.menu_item_documents DROP CONSTRAINT menu_item_documents_document_type_check;
ALTER TABLE public.menu_item_documents ADD CONSTRAINT menu_item_documents_document_type_check 
CHECK (document_type = ANY (ARRAY['file'::text, 'checklist'::text, 'sop_guide'::text, 'project'::text, 'pipe_drawer'::text, 'follow_up_list'::text]));