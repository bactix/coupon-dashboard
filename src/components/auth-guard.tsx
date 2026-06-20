"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid, clearToken } from "@/lib/api-client";
import { clearStoredUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isTokenValid()) {
      // Clear any expired/tampered token so it can't linger, then bounce to login.
      clearToken();
      clearStoredUser();
      router.replace("/login");
      setIsAuthed(false);
    } else {
      setIsAuthed(true);
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return null;
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}
