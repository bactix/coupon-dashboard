"use client";

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BusinessForm } from "./business-form";
import { BusinessFormValues, BusinessEditFormValues } from "@/lib/schemas";

interface BusinessFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BusinessFormValues | BusinessEditFormValues) => void;
  defaultValues?: Partial<BusinessFormValues | BusinessEditFormValues>;
  isEditing?: boolean;
}

export const BusinessFormDialog = memo(function BusinessFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: BusinessFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Business" : "Add New Business"}
          </DialogTitle>
        </DialogHeader>
        <BusinessForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          submitLabel={isEditing ? "Save Changes" : "Add Business"}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
});
