"use client";

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";
import { UserEditFormValues, UserFormValues } from "@/lib/schemas";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues | UserEditFormValues) => void;
  defaultValues?: Partial<UserFormValues | UserEditFormValues>;
  isEditing?: boolean;
}

export const UserFormDialog = memo(function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          submitLabel={isEditing ? "Save Changes" : "Add User"}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
});
