"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { ApiError } from "@/lib/errors";
import { queryKeys } from "@/lib/query/keys";
import { authApi } from "@/features/auth/api";
import type { LoginValues, RegisterValues } from "@/features/auth/schemas";
import type { UserView } from "@/types/api";

/** Current session. `null` = signed out. `initialData` seeds it from the server. */
export function useSession(initialData?: UserView | null) {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      try {
        return await authApi.session();
      } catch (err) {
        if (err instanceof ApiError && err.isUnauthorized) return null;
        throw err;
      }
    },
    initialData,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginValues) => authApi.login(values),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.session, user);
      router.replace(ROUTES.dashboard);
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: RegisterValues) => authApi.register(values),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.session, user);
      router.replace(ROUTES.dashboard);
      router.refresh();
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      qc.clear();
      router.replace(ROUTES.login);
      router.refresh();
    },
  });
}
