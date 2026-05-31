"use client";

import { useEffect } from "react";
import { seedData } from "@/lib/seed-data";

export function SeedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedData();
  }, []);

  return <>{children}</>;
}
