import { apiGet, apiPost } from "@/lib/api/http";
import * as tokenStorage from "@/lib/auth/token-storage";
import type { AuthResult, UserView } from "@/types/api";
import type { LoginValues, RegisterValues } from "@/features/auth/schemas";

export const authApi = {
  /** Current user, or `null` when unauthenticated / no session stored. */
  session: () => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      return Promise.resolve(null as UserView | null);
    }
    return apiGet<UserView>("/auth/me");
  },

  login: (values: LoginValues) =>
    apiPost<AuthResult>("/auth/login", values).then((result) => {
      tokenStorage.setTokens(result);
      return result.user;
    }),

  register: (values: RegisterValues) => {
    const { name, email, password } = values;
    return apiPost<AuthResult>("/auth/register", { name, email, password }).then((result) => {
      tokenStorage.setTokens(result);
      return result.user;
    });
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiPost("/auth/logout", { refresh_token: refreshToken, all_sessions: false }).catch(
        () => undefined,
      );
    }
    tokenStorage.clearTokens();
    tokenStorage.clearAllImageKeys();
  },
};
