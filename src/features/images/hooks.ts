"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/toast";
import { imageKeyApi, imagesApi } from "@/features/images/api";
import type { ImageListParams, UpdateImageBody } from "@/types/api";

export function useImageKeyStatus(projectId: string) {
  return useQuery({
    queryKey: queryKeys.imageKey(projectId),
    queryFn: () => imageKeyApi.status(projectId),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });
}

export function useConfigureImageKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (secret: string) => imageKeyApi.configure(projectId, secret),
    onSuccess: (status) => {
      qc.setQueryData(queryKeys.imageKey(projectId), status);
      qc.invalidateQueries({ queryKey: queryKeys.images.all });
      toast.success("Image key configured");
    },
    onError: (err) => toast.error(err),
  });
}

export function useRemoveImageKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => imageKeyApi.remove(projectId),
    onSuccess: (status) => {
      qc.setQueryData(queryKeys.imageKey(projectId), status);
      toast.success("Image key removed");
    },
    onError: (err) => toast.error(err),
  });
}

export function useImagesList(projectId: string, params: ImageListParams) {
  return useQuery({
    queryKey: queryKeys.images.list(projectId, params),
    queryFn: () => imagesApi.list(projectId, params),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}

export function useImage(projectId: string, id: string | null) {
  return useQuery({
    queryKey: queryKeys.images.detail(projectId, id ?? ""),
    queryFn: () => imagesApi.get(projectId, id as string),
    enabled: Boolean(projectId && id),
  });
}

export function useUpdateImage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateImageBody }) =>
      imagesApi.update(projectId, id, body),
    onSuccess: (image) => {
      qc.setQueryData(queryKeys.images.detail(projectId, image.id), image);
      qc.invalidateQueries({ queryKey: queryKeys.images.all });
      toast.success("Image updated");
    },
    onError: (err) => toast.error(err),
  });
}

export function useDeleteImage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imagesApi.remove(projectId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.images.all });
      toast.success("Image deleted");
    },
    onError: (err) => toast.error(err),
  });
}
