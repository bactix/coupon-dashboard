"use client";

import { useState, useCallback } from "react";
import { User } from "@/domain/users";
import { UserFormValues } from "@/lib/schemas";

interface UseUserFormProps {
  onSubmit: (values: UserFormValues, isEditing: boolean, id?: string) => Promise<void>;
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
    async (values: UserFormValues) => {
      await onSubmit(values, !!editingUser, editingUser?.id);
      closeDialog();
    },
    [editingUser, onSubmit, closeDialog]
  );

  const getDefaultValues = useCallback((): UserFormValues => {
    if (editingUser) {
      return {
        name: editingUser.name,
        email: editingUser.email,
        password: editingUser.password,
        phone: editingUser.phone,
        status: editingUser.status,
      };
    }

    return {
      name: "",
      email: "",
      password: "",
      phone: "+961 ",
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
