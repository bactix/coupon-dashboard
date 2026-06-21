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
  onConfirm: (startDate: string, expiryDate: string) => void;
  userName?: string;
}

/** Formats a Date as the `YYYY-MM-DD` value expected by `<input type="date">`. */
function toDateInputValue(date: Date): string {
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Default start date: today. */
function defaultStart(): string {
  return toDateInputValue(new Date());
}

/** Default expiry: one year from the given start date (defaults to today). */
function defaultExpiry(startDate?: string): string {
  const base = startDate ? new Date(startDate) : new Date();
  if (isNaN(base.getTime())) return "";
  base.setFullYear(base.getFullYear() + 1);
  return toDateInputValue(base);
}

export function UserRenewalDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: UserRenewalDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Reset to defaults (start = today, expiry = today + 1 year) each time the
  // dialog opens.
  useEffect(() => {
    if (open) {
      const start = defaultStart();
      setStartDate(start);
      setExpiryDate(defaultExpiry(start));
    }
  }, [open]);

  // When the user changes the start date, keep the expiry one year ahead.
  const handleStartChange = (value: string) => {
    setStartDate(value);
    setExpiryDate(defaultExpiry(value));
  };

  const handleConfirm = () => {
    if (!startDate || !expiryDate) return;
    onConfirm(startDate, expiryDate);
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
            <Label htmlFor="renewal-start-date">Start Date</Label>
            <Input
              id="renewal-start-date"
              type="date"
              value={startDate}
              onChange={(e) => handleStartChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to today.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renewal-expiry-date">Expiry Date</Label>
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
          <Button onClick={handleConfirm} disabled={!startDate || !expiryDate}>
            Confirm Renewal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
