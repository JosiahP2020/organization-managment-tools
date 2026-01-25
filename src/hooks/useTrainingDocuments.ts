import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DocumentCategory = "machine_operation" | "machine_maintenance" | "sop_training";

interface TrainingDocument {
  id: string;
  title: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  category: DocumentCategory;
  created_at: string;
  archived_at: string | null;
}

export function useTrainingDocuments(category: DocumentCategory) {
  const { organization } = useAuth();

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ["training-documents", organization?.id, category],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from("training_documents")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("category", category)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching training documents:", error);
        throw error;
      }

      return data as TrainingDocument[];
    },
    enabled: !!organization?.id,
  });

  return { documents, isLoading, refetch };
}
