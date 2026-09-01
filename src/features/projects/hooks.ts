"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/toast";
import { projectsApi, type ProjectListParams } from "@/features/projects/api";
import type { CreateProjectBody, UpdateProjectBody } from "@/types/api";

export function useProjectsList(params: ProjectListParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProjectBody) => projectsApi.create(body),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success(`Project “${project.name}” created`);
    },
    onError: (err) => toast.error(err),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProjectBody) => projectsApi.update(id, body),
    onSuccess: (project) => {
      qc.setQueryData(queryKeys.projects.detail(id), project);
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success("Project updated");
    },
    onError: (err) => toast.error(err),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success("Project deleted");
    },
    onError: (err) => toast.error(err),
  });
}
