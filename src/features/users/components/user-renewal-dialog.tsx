"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UserRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName?: string;
  currentExpiryDate?: string;
}

export function UserRenewalDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  currentExpiryDate,
}: UserRenewalDialogProps) {
  const getNewExpiryDate = () => {
    const newDate = new Date();
    newDate.setFullYear(newDate.getFullYear() + 1);
    return newDate.toLocaleDateString("en-GB");
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Renew Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {userName && (
            <p className="text-sm text-muted-foreground">
              Renew subscription for <strong>{userName}</strong> for one year?
            </p>
          )}
          <div className="space-y-1.5">
            <Label>New Expiry Date</Label>
            <p className="text-sm font-medium">{getNewExpiryDate()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Renewal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
