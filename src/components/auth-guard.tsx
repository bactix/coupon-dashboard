"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api-client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
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
