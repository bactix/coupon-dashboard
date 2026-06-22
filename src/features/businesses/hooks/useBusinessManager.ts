"use client";

import { useState, useCallback, useMemo } from "react";
import { Business, CreateBusinessInput, UpdateBusinessInput } from "@/domain/businesses/business.types";
import { BusinessService } from "@/domain/businesses/business.service";
import { useBusinessRepository } from "./useBusinessRepository";

/**
 * Manages business data and operations
 */
export function useBusinessManager() {
  const repository = useBusinessRepository();
  const service = useMemo(() => new BusinessService(), []);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initializeBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await repository.getAll();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const addBusiness = useCallback(
    async (input: CreateBusinessInput) => {
      const newBusiness = await repository.create(input as any);
      setBusinesses((prev) => [newBusiness, ...prev]);
      return newBusiness;
    },
    [repository]
  );

  const updateBusiness = useCallback(
    async (id: string, updates: UpdateBusinessInput) => {
      const business = businesses.find((b) => b.id === id);
      if (!business) return;

      const updated = service.updateBusiness(business, updates);
      await repository.update(id, updated);
      setBusinesses((prev) => prev.map((b) => (b.id === id ? updated : b)));
    },
    [businesses, service, repository]
  );

  const deleteBusiness = useCallback(
    async (id: string) => {
      await repository.delete(id);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    },
    [repository]
  );

  const getBusinessById = useCallback(
    (id: string) => businesses.find((b) => b.id === id),
    [businesses]
  );

  return {
    businesses,
    isLoading,
    initializeBusinesses,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessById,
  };
}
