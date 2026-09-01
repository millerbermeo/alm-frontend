import { apiGet, apiPost } from "@/lib/api/http";
import type { UserView } from "@/types/api";
import type { LoginValues, RegisterValues } from "@/features/auth/schemas";

interface SessionPayload {
  user: UserView;
}

export const authApi = {
  /** Current user, or `null` when unauthenticated (BFF returns 401). */
  session: () => apiGet<SessionPayload>("/auth/session").then((p) => p.user),

  login: (values: LoginValues) =>
    apiPost<SessionPayload>("/auth/login", values).then((p) => p.user),

  register: (values: RegisterValues) =>
    apiPost<SessionPayload>("/auth/register", values).then((p) => p.user),

  logout: () => apiPost<null>("/auth/logout"),
};
