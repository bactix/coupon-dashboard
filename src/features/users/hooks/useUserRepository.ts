"use client";

import { useMemo } from "react";
import { ApiUserRepository } from "@/infrastructure/api/user.repository";

export function useUserRepository() {
  return useMemo(() => new ApiUserRepository(), []);
}
