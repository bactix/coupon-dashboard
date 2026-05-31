"use client";

import { useState, useCallback } from "react";
import { Coupon, CreateCouponInput, UpdateCouponInput } from "@/domain/coupons/coupon.types";
import { useCouponRepository } from "./useCouponRepository";

export function useCouponManager() {
  const repository = useCouponRepository();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initializeCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await repository.getAll();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const addCoupon = useCallback(
    async (input: CreateCouponInput) => {
      setIsLoading(true);
      try {
        const coupon = await repository.create(input);
        setCoupons((prev) => [coupon, ...prev]);
        return coupon;
      } finally {
        setIsLoading(false);
      }
    },
    [repository]
  );

  const updateCoupon = useCallback(
    async (id: string, updates: UpdateCouponInput) => {
      setIsLoading(true);
      try {
        const updated = await repository.update(id, updates);
        setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      } finally {
        setIsLoading(false);
      }
    },
    [repository]
  );

  const deleteCoupon = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await repository.delete(id);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } finally {
        setIsLoading(false);
      }
    },
    [repository]
  );

  const useCoupon = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const result = await (repository as any).use(id);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [repository]
  );

  const getCouponById = useCallback((id: string) => coupons.find((c) => c.id === id), [coupons]);

  const getCouponsByBusinessId = useCallback(
    (businessId: string) => coupons.filter((c) => c.businessId === businessId),
    [coupons]
  );

  return {
    coupons,
    isLoading,
    initializeCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    useCoupon,
    getCouponById,
    getCouponsByBusinessId,
  };
}
