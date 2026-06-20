"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { setStoredUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api-client";
import { AppUser } from "@/types/user";

export function useAccount() {
  const { getCurrentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentUser = getCurrentUser();

  const updateAccount = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        if (!currentUser) {
          setError("No user logged in");
          return;
        }

        const body: Record<string, string> = {
          name: data.name,
          email: data.email,
          phone: data.phone,
        };
        // Only send the password when the user actually entered a new one.
        if (data.password) {
          body.password = data.password;
        }

        const updated = await apiRequest<AppUser>(
          `/api/dashboard/users/${currentUser.id}`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          }
        );

        setStoredUser(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update account";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  return {
    currentUser,
    updateAccount,
    isLoading,
    error,
    success,
  };
}
