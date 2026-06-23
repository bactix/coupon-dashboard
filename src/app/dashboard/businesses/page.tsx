"use client";

import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { useBusinessManager } from "@/features/businesses/hooks/useBusinessManager";
import { useBusinessForm } from "@/features/businesses/hooks/use-business-form";
import { usePagination } from "@/hooks/use-pagination";
import { BusinessesPageHeader } from "@/features/businesses/components/businesses-page-header";
import { BusinessTable } from "@/features/businesses/components/business-table";
import { BusinessFormDialog } from "@/features/businesses/components/business-form-dialog";
import { BusinessDeleteDialog } from "@/features/businesses/components/business-delete-dialog";
import { BusinessChangePasswordDialog } from "@/features/businesses/components/business-change-password-dialog";
import { Business } from "@/domain/businesses/business.types";

export default function BusinessesPage() {
  const {
    businesses,
    isLoading,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessById,
    initializeBusinesses
  } = useBusinessManager();

  useEffect(() => {
    const loadData = async () => {
      await initializeBusinesses();
    };
    loadData();
  }, [initializeBusinesses]);

  const {
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormSubmit,
    getDefaultValues,
    isEditing,
  } = useBusinessForm({
    onSubmit: async (values, isEdit, id) => {
      if (isEdit && id) {
        await updateBusiness(id, values);
      } else {
        await addBusiness(values as any);
      }
    },
  });

  const pagination = usePagination(businesses, 10);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deletingBusiness = deleteId ? getBusinessById(deleteId) : null;

  const [changePasswordBusiness, setChangePasswordBusiness] = useState<Business | null>(null);

  const handleChangePassword = async (password: string) => {
    if (changePasswordBusiness) {
      await updateBusiness(changePasswordBusiness.id, { password });
      setChangePasswordBusiness(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBusiness(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <SidebarInset>
      <BusinessesPageHeader
        onAddClick={openCreateDialog}
        businessCount={businesses.length}
      />

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Loading businesses...</p>
          </div>
        ) : (
          <BusinessTable
            businesses={pagination.paginatedItems}
            onEdit={openEditDialog}
            onDelete={setDeleteId}
            onChangePassword={setChangePasswordBusiness}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onNext={pagination.goToNext}
            onPrev={pagination.goToPrev}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
          />
        )}
      </div>

      <BusinessFormDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onSubmit={handleFormSubmit}
        defaultValues={getDefaultValues()}
        isEditing={isEditing}
      />

      <BusinessChangePasswordDialog
        open={!!changePasswordBusiness}
        onOpenChange={(open) => { if (!open) setChangePasswordBusiness(null); }}
        onConfirm={handleChangePassword}
        businessName={changePasswordBusiness?.name}
      />

      <BusinessDeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        businessName={deletingBusiness?.name}
      />
    </SidebarInset>
  );
}
