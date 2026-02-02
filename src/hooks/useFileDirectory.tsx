import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface FileDirectoryFile {
  id: string;
  menu_item_id: string;
  organization_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export function useFileDirectory(menuItemId: string | undefined) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch files for a file directory menu item
  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ["file-directory-files", menuItemId],
    queryFn: async () => {
      if (!menuItemId || !organization?.id) return [];

      const { data, error } = await supabase
        .from("file_directory_files")
        .select("*")
        .eq("menu_item_id", menuItemId)
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FileDirectoryFile[];
    },
    enabled: !!menuItemId && !!organization?.id,
  });

  // Upload a file
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!organization?.id || !user?.id || !menuItemId) {
        throw new Error("Not authenticated");
      }

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const filePath = `${organization.id}/${menuItemId}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("file-directory")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("file-directory")
        .getPublicUrl(filePath);

      // Create database record
      const { data, error } = await supabase
        .from("file_directory_files")
        .insert({
          menu_item_id: menuItemId,
          organization_id: organization.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type || null,
          file_size: file.size,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-directory-files", menuItemId] });
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file");
    },
  });

  // Delete a file
  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!organization?.id) throw new Error("Not authenticated");

      // Get file info first
      const { data: file, error: fetchError } = await supabase
        .from("file_directory_files")
        .select("file_url")
        .eq("id", fileId)
        .single();

      if (fetchError) throw fetchError;

      // Extract path from URL and delete from storage
      if (file?.file_url) {
        const url = new URL(file.file_url);
        const pathParts = url.pathname.split("/file-directory/");
        if (pathParts.length > 1) {
          await supabase.storage
            .from("file-directory")
            .remove([pathParts[1]]);
        }
      }

      // Delete database record
      const { error } = await supabase
        .from("file_directory_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-directory-files", menuItemId] });
      toast.success("File deleted");
    },
    onError: (error) => {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    },
  });

  // Rename a file
  const renameFile = useMutation({
    mutationFn: async ({ fileId, newName }: { fileId: string; newName: string }) => {
      const { data, error } = await supabase
        .from("file_directory_files")
        .update({ file_name: newName.trim() })
        .eq("id", fileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-directory-files", menuItemId] });
      toast.success("File renamed");
    },
    onError: (error) => {
      console.error("Failed to rename file:", error);
      toast.error("Failed to rename file");
    },
  });

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
    renameFile,
  };
}
