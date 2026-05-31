"use client";

import { useMemo } from "react";
import { ApiBusinessRepository } from "@/infrastructure/api/business.repository";

export function useBusinessRepository() {
  return useMemo(() => new ApiBusinessRepository(), []);
}
