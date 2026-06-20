"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UserRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (expiryDate: string) => void;
  userName?: string;
  startDate?: string;
}

/** Formats a Date as the `YYYY-MM-DD` value expected by `<input type="date">`. */
function toDateInputValue(date: Date): string {
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Default new expiry: one year from the user's start date. */
function defaultExpiryFromStart(startDate?: string): string {
  const base = startDate ? new Date(startDate) : new Date();
  if (isNaN(base.getTime())) return toDateInputValue(new Date());
  base.setFullYear(base.getFullYear() + 1);
  return toDateInputValue(base);
}

export function UserRenewalDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  startDate,
}: UserRenewalDialogProps) {
  const [expiryDate, setExpiryDate] = useState("");

  // Reset to the default (start date + 1 year) each time the dialog opens.
  useEffect(() => {
    if (open) {
      setExpiryDate(defaultExpiryFromStart(startDate));
    }
  }, [open, startDate]);

  const handleConfirm = () => {
    if (!expiryDate) return;
    onConfirm(expiryDate);
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
              Renew subscription for <strong>{userName}</strong>.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="renewal-expiry-date">New Expiry Date</Label>
            <Input
              id="renewal-expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to one year from the start date. You can change it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!expiryDate}>
            Confirm Renewal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
