"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/toast";
import { foldersApi } from "@/features/folders/api";
import type { CreateFolderBody, UpdateFolderBody } from "@/types/api";

/** All folders of a project (flat list; the tree is built client-side). */
export function useFolders(projectId: string) {
  return useQuery({
    queryKey: queryKeys.folders.listByProject(projectId),
    queryFn: () => foldersApi.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateFolder(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFolderBody) => foldersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.folders.listByProject(projectId) });
      toast.success("Folder created");
    },
    onError: (err) => toast.error(err),
  });
}

export function useRenameFolder(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateFolderBody }) =>
      foldersApi.rename(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.folders.listByProject(projectId) });
      toast.success("Folder renamed");
    },
    onError: (err) => toast.error(err),
  });
}

export function useDeleteFolder(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.folders.listByProject(projectId) });
      toast.success("Folder deleted");
    },
    onError: (err) => toast.error(err),
  });
}
