import { useRouter } from "next/navigation";
import {
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  type AuthUser,
} from "@/lib/auth";
import { apiRequest, setToken, clearToken } from "@/lib/api-client";

export function useAuth() {
  const router = useRouter();

  const login = async (
    email: string,
    password: string,
    type: "user" | "business"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest<{ token: string; user: AuthUser }>(
        "/api/dashboard/auth",
        {
          method: "POST",
          body: JSON.stringify({ email, password, type }),
        }
      );

      setToken(response.token);
      setStoredUser(response.user);
      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
      return { success: false, error: message };
    }
  };

  const logout = (): void => {
    clearStoredUser();
    clearToken();
    router.push("/login");
  };

  const getCurrentUser = (): AuthUser | null => {
    return getStoredUser();
  };

  const isAuthenticated = (): boolean => {
    return getStoredUser() !== null;
  };

  return {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
  };
}
