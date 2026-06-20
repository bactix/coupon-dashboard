"use client";

import { useState, useCallback } from "react";
import { User } from "@/domain/users";
import { UserEditFormValues, UserFormValues } from "@/lib/schemas";

interface UseUserFormProps {
  onSubmit: (values: UserFormValues | UserEditFormValues, isEditing: boolean, id?: string) => Promise<void>;
}

/** Formats an ISO date string as the `YYYY-MM-DD` value an `<input type="date">` expects. */
function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function useUserForm({ onSubmit }: UseUserFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingUser(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingUser(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: UserFormValues | UserEditFormValues) => {
      await onSubmit(values, !!editingUser, editingUser?.id);
      closeDialog();
    },
    [editingUser, onSubmit, closeDialog]
  );

  const getDefaultValues = useCallback((): UserFormValues | UserEditFormValues => {
    if (editingUser) {
      return {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone.startsWith("+")
          ? editingUser.phone.replace(/^\+\d{1,4}\s?/, "")
          : editingUser.phone,
        status: editingUser.status,
        startDate: toDateInputValue(editingUser.startDate),
      };
    }

    return {
      name: "",
      email: "",
      password: "",
      phone: "",
      status: "active",
    };
  }, [editingUser]);

  return {
    isDialogOpen,
    editingUser,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormSubmit,
    getDefaultValues,
    isEditing: !!editingUser,
  };
}
