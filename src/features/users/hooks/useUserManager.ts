"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { User, CreateUserInput, UpdateUserInput } from "@/domain/users/user.types";
import { UserService } from "@/domain/users/user.service";
import { useUserRepository } from "./useUserRepository";

/**
 * Manages user data and operations with server-side pagination.
 * Orchestrates domain logic (UserService) with data access (Repository).
 */
export function useUserManager(pageSize = 10) {
  const repository = useUserRepository();
  const service = useMemo(() => new UserService(), []);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Keep the latest page in a ref so callbacks (next/prev, post-mutation
  // refetches) always read the current value without re-creating themselves.
  const currentPageRef = useRef(1);

  const fetchPage = useCallback(
    async (page: number) => {
      const target = Math.max(1, page);
      setIsLoading(true);
      try {
        const result = await repository.getPaginated(target, pageSize);
        const pages = Math.max(1, result.pagination.pages);

        // Requested page is past the end (e.g. after deleting the last row on
        // the last page) — snap back to the last available page.
        if (target > pages) {
          return fetchPage(pages);
        }

        setUsers(result.data);
        setTotalItems(result.pagination.total);
        setTotalPages(pages);
        setCurrentPage(result.pagination.page);
        currentPageRef.current = result.pagination.page;
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [repository, pageSize]
  );

  const initializeUsers = useCallback(() => fetchPage(1), [fetchPage]);

  const goToNext = useCallback(
    () => fetchPage(currentPageRef.current + 1),
    [fetchPage]
  );
  const goToPrev = useCallback(
    () => fetchPage(currentPageRef.current - 1),
    [fetchPage]
  );
  const goToPage = useCallback((page: number) => fetchPage(page), [fetchPage]);

  const addUser = useCallback(
    async (input: CreateUserInput) => {
      const newUser = service.createUser(input);
      const created = await repository.create(newUser);
      // New users sort to the top (newest first), so jump to the first page.
      await fetchPage(1);
      return created;
    },
    [service, repository, fetchPage]
  );

  const updateUser = useCallback(
    async (id: string, updates: UpdateUserInput) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      const updated = service.updateUser(user, updates);
      await repository.update(id, updated);
      await fetchPage(currentPageRef.current);
    },
    [users, service, repository, fetchPage]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await repository.delete(id);
      await fetchPage(currentPageRef.current);
    },
    [repository, fetchPage]
  );

  const renewUser = useCallback(
    async (id: string, expiryDate?: string) => {
      await (
        repository as { renew(id: string, expiryDate?: string): Promise<User> }
      ).renew(id, expiryDate);
      await fetchPage(currentPageRef.current);
    },
    [repository, fetchPage]
  );

  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  return {
    users,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    initializeUsers,
    goToNext,
    goToPrev,
    goToPage,
    addUser,
    updateUser,
    deleteUser,
    renewUser,
    getUserById,
  };
}
