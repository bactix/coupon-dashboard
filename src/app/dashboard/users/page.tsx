"use client";

import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { useUserManager } from "@/features/users/hooks/useUserManager";
import { useUserForm } from "@/features/users/hooks/use-user-form";
import { UserFormValues } from "@/lib/schemas";
import { User } from "@/domain/users";
import { UsersPageHeader } from "@/features/users/components/users-page-header";
import { UserTable } from "@/features/users/components/user-table";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserDeleteDialog } from "@/features/users/components/user-delete-dialog";
import { UserRenewalDialog } from "@/features/users/components/user-renewal-dialog";
import { UserChangePasswordDialog } from "@/features/users/components/user-change-password-dialog";

export default function UsersPage() {
  const {
    users,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNext,
    hasPrev,
    goToNext,
    goToPrev,
    addUser,
    updateUser,
    deleteUser,
    renewUser,
    getUserById,
    initializeUsers
  } = useUserManager(10);

  useEffect(() => {
    const loadData = async () => {
      await initializeUsers();
    };
    loadData();
  }, [initializeUsers]);

  const {
    isDialogOpen,
    editingUser,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormSubmit,
    getDefaultValues,
    isEditing,
  } = useUserForm({
    onSubmit: async (values, isEdit, id) => {
      if (isEdit && id) {
        await updateUser(id, values);
      } else {
        await addUser(values as UserFormValues);
      }
    },
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deletingUser = deleteId ? getUserById(deleteId) : null;

  const [renewalUser, setRenewalUser] = useState<User | null>(null);
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteUser(deleteId);
      setDeleteId(null);
    }
  };

  const handleRenewal = async (startDate: string, expiryDate: string) => {
    if (renewalUser) {
      await renewUser(renewalUser.id, expiryDate, startDate);
      setRenewalUser(null);
    }
  };

  const handleChangePassword = async (password: string) => {
    if (changePasswordUser) {
      await updateUser(changePasswordUser.id, { password });
      setChangePasswordUser(null);
    }
  };

  return (
    <SidebarInset>
      <UsersPageHeader
        onAddClick={openCreateDialog}
        userCount={totalItems}
      />

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <UserTable
            users={users}
            onEdit={openEditDialog}
            onDelete={setDeleteId}
            onRenew={setRenewalUser}
            onChangePassword={setChangePasswordUser}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onNext={goToNext}
            onPrev={goToPrev}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        )}
      </div>

      <UserFormDialog
        key={editingUser?.id ?? "create"}
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onSubmit={handleFormSubmit}
        defaultValues={getDefaultValues()}
        isEditing={isEditing}
      />

      <UserDeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        userName={deletingUser?.name}
      />

      <UserRenewalDialog
        open={!!renewalUser}
        onOpenChange={(open) => { if (!open) setRenewalUser(null); }}
        onConfirm={handleRenewal}
        userName={renewalUser?.name}
      />

      <UserChangePasswordDialog
        open={!!changePasswordUser}
        onOpenChange={(open) => { if (!open) setChangePasswordUser(null); }}
        onConfirm={handleChangePassword}
        userName={changePasswordUser?.name}
      />
    </SidebarInset>
  );
}
