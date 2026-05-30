import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectionAdapter } from "@/components/selection";
import type { MoveTarget, SelectionAdapter } from "@/components/selection";

/**
 * Selection adapter for files inside a file directory.
 * surface: files:<menuItemId>
 */
export function useFilesSelectionAdapter(menuItemId: string | undefined) {
  const { organization, user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const surface = menuItemId ? `files:${menuItemId}` : null;

  const { data: directories } = useQuery({
    queryKey: ["file-directory-targets", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data } = await supabase
        .from("menu_items")
        .select("id, name, category_id, menu_categories!inner(name)")
        .eq("organization_id", organization.id)
        .eq("item_type", "file_directory");
      return data || [];
    },
    enabled: !!organization?.id && isAdmin,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["file-directory-files"] });
  }, [queryClient]);

  const adapter = useMemo<SelectionAdapter | null>(() => {
    if (!surface || !menuItemId || !isAdmin || !organization?.id || !user?.id) return null;

    const storagePathFromUrl = (url: string): string | null => {
      try {
        const u = new URL(url);
        const parts = u.pathname.split("/file-directory/");
        return parts[1] || null;
      } catch {
        return null;
      }
    };

    return {
      surface,
      surfaceLabel: "Files",
      canRename: true,
      canMove: true,
      canCopy: true,
      canDelete: true,
      rename: async (id, newName) => {
        const { error } = await supabase
          .from("file_directory_files")
          .update({ file_name: newName })
          .eq("id", id);
        if (error) throw error;
        invalidate();
      },
      delete: async (ids) => {
        const { data: files } = await supabase
          .from("file_directory_files")
          .select("id, file_url")
          .in("id", ids);
        const paths = (files || [])
          .map((f) => storagePathFromUrl(f.file_url))
          .filter(Boolean) as string[];
        if (paths.length) {
          await supabase.storage.from("file-directory").remove(paths);
        }
        const { error } = await supabase
          .from("file_directory_files")
          .delete()
          .in("id", ids);
        if (error) throw error;
        invalidate();
      },
      move: async (ids, target) => {
        const [, newMenuItemId] = target.id.split(":");
        const { error } = await supabase
          .from("file_directory_files")
          .update({ menu_item_id: newMenuItemId })
          .in("id", ids);
        if (error) throw error;
        invalidate();
      },
      copy: async (ids, target) => {
        const [, newMenuItemId] = target.id.split(":");
        const { data: sources, error: srcErr } = await supabase
          .from("file_directory_files")
          .select("*")
          .in("id", ids);
        if (srcErr) throw srcErr;
        for (const src of sources || []) {
          // Copy storage object
          const srcPath = storagePathFromUrl(src.file_url);
          let newUrl = src.file_url;
          if (srcPath) {
            const newPath = `${organization.id}/${newMenuItemId}/${Date.now()}-${src.file_name}`;
            const { data: blob, error: dlErr } = await supabase.storage
              .from("file-directory")
              .download(srcPath);
            if (!dlErr && blob) {
              const { error: upErr } = await supabase.storage
                .from("file-directory")
                .upload(newPath, blob, { contentType: src.file_type || undefined });
              if (!upErr) {
                const { data: u } = supabase.storage
                  .from("file-directory")
                  .getPublicUrl(newPath);
                newUrl = u.publicUrl;
              }
            }
          }
          await supabase.from("file_directory_files").insert({
            menu_item_id: newMenuItemId,
            organization_id: organization.id,
            file_name: src.file_name,
            file_url: newUrl,
            file_type: src.file_type,
            file_size: src.file_size,
            uploaded_by: user.id,
          });
        }
        invalidate();
      },
      listMoveTargets: (): MoveTarget[] => {
        return (directories || [])
          .filter((d) => d.id !== menuItemId)
          .map((d: any) => ({
            id: `dir:${d.id}`,
            label: d.name,
            group: d.menu_categories?.name || "File Directories",
          }));
      },
    };
  }, [surface, menuItemId, isAdmin, organization?.id, user?.id, directories, invalidate]);

  useSelectionAdapter(adapter);
  return surface;
}
