"use client";

import { useState, useCallback } from "react";
import { Business } from "@/domain/businesses";
import { BusinessFormValues } from "@/lib/schemas";
import { BUSINESS_FORM_DEFAULTS } from "@/features/businesses/constants";

interface UseBusinessFormProps {
  onSubmit: (values: BusinessFormValues, isEditing: boolean, id?: string) => Promise<void>;
}

export function useBusinessForm({ onSubmit }: UseBusinessFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingBusiness(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((business: Business) => {
    setEditingBusiness(business);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingBusiness(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: BusinessFormValues) => {
      await onSubmit(values, !!editingBusiness, editingBusiness?.id);
      closeDialog();
    },
    [editingBusiness, onSubmit, closeDialog]
  );

  const getDefaultValues = useCallback((): BusinessFormValues => {
    if (editingBusiness) {
      return {
        name: editingBusiness.name,
        type: editingBusiness.type,
        email: editingBusiness.email,
        password: editingBusiness.password,
        phone: editingBusiness.phone,
        ownerName: editingBusiness.ownerName,
        city: editingBusiness.city,
        businessModel: editingBusiness.businessModel,
        usageLimit: editingBusiness.usageLimit,
      };
    }

    return {
      name: "",
      type: BUSINESS_FORM_DEFAULTS.type,
      email: "",
      password: "",
      phone: BUSINESS_FORM_DEFAULTS.phone,
      ownerName: "",
      city: BUSINESS_FORM_DEFAULTS.city,
      businessModel: BUSINESS_FORM_DEFAULTS.businessModel,
      usageLimit: undefined,
    };
  }, [editingBusiness]);

  return {
    isDialogOpen,
    editingBusiness,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormSubmit,
    getDefaultValues,
    isEditing: !!editingBusiness,
  };
}
