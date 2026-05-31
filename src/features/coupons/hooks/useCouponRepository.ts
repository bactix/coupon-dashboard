"use client";

import { useMemo } from "react";
import { ApiCouponRepository } from "@/infrastructure/api/coupon.repository";

export function useCouponRepository() {
  return useMemo(() => new ApiCouponRepository(), []);
}
