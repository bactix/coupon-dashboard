"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PlusIcon, PencilIcon, TrashIcon, PlusCircleIcon } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type DiscountType = "percentage" | "fixed";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: DiscountType;
  maxUses: number;
  usedCount: number;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
}

// ── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discount: z.number().min(0.01, "Discount must be greater than 0"),
  discountType: z.enum(["percentage", "fixed"] as const),
  maxUses: z.number().int().min(1, "Must allow at least 1 use"),
  userId: z.string().min(1, "Please link this coupon to a user"),
  expiresAt: z.string().min(1, "Expiry date is required"),
});

type FormValues = z.infer<typeof schema>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(coupon: Coupon): "active" | "exhausted" | "expired" {
  if (coupon.usedCount >= coupon.maxUses) return "exhausted";
  if (new Date(coupon.expiresAt) < new Date()) return "expired";
  return "active";
}

const statusVariant: Record<
  "active" | "exhausted" | "expired",
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  exhausted: "secondary",
  expired: "destructive",
};

function formatDiscount(coupon: Coupon) {
  return coupon.discountType === "percentage"
    ? `${coupon.discount}%`
    : `$${coupon.discount}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>("coupons", []);
  const [users] = useLocalStorage<AppUser[]>("app-users", []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { discountType: "percentage" },
  });

  const discountTypeValue = watch("discountType");
  const userIdValue = watch("userId");

  function openCreate() {
    setEditing(null);
    reset({
      code: "",
      discount: undefined,
      discountType: "percentage",
      maxUses: undefined,
      userId: "",
      expiresAt: "",
    });
    setDialogOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    reset({
      code: c.code,
      discount: c.discount,
      discountType: c.discountType,
      maxUses: c.maxUses,
      userId: c.userId,
      expiresAt: c.expiresAt,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    const code = values.code.toUpperCase();
    if (editing) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editing.id ? { ...c, ...values, code } : c
        )
      );
    } else {
      setCoupons((prev) => [
        {
          id: Math.random().toString(36).slice(2),
          ...values,
          code,
          usedCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setDialogOpen(false);
  }

  function incrementUse(id: string) {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id && c.usedCount < c.maxUses
          ? { ...c, usedCount: c.usedCount + 1 }
          : c
      )
    );
  }

  function confirmDelete() {
    if (deleteId) {
      setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    }
  }

  function getUserName(userId: string) {
    const u = users.find((u) => u.id === userId);
    return u ? u.name : <span className="text-muted-foreground italic">Unknown user</span>;
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Coupons</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coupons</h1>
            <p className="text-sm text-muted-foreground">
              Manage coupons, track usage, and link them to users
            </p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Linked User</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No coupons yet. Click &quot;Add Coupon&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((c) => {
                  const status = deriveStatus(c);
                  const canIncrement = status === "active";
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-semibold tracking-wide">
                        {c.code}
                      </TableCell>
                      <TableCell>{formatDiscount(c)}</TableCell>
                      <TableCell>{getUserName(c.userId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums">
                            {c.usedCount}{" "}
                            <span className="text-muted-foreground">/ {c.maxUses}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={!canIncrement}
                            title="Record one use"
                            onClick={() => incrementUse(c.id)}
                          >
                            <PlusCircleIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[status]} className="capitalize">
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.expiresAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(c)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(c.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Code */}
            <div className="space-y-1">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                placeholder="e.g. BEIRUT20"
                className="uppercase"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="discount">Discount Value</Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="e.g. 20"
                  {...register("discount", { valueAsNumber: true })}
                />
                {errors.discount && (
                  <p className="text-xs text-destructive">{errors.discount.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="discountType">Type</Label>
                <Select
                  value={discountTypeValue}
                  onValueChange={(v) => setValue("discountType", v as DiscountType)}
                >
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && (
                  <p className="text-xs text-destructive">{errors.discountType.message}</p>
                )}
              </div>
            </div>

            {/* Max uses */}
            <div className="space-y-1">
              <Label htmlFor="maxUses">Max Allowed Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 100"
                {...register("maxUses", { valueAsNumber: true })}
              />
              {errors.maxUses && (
                <p className="text-xs text-destructive">{errors.maxUses.message}</p>
              )}
            </div>

            {/* Linked user */}
            <div className="space-y-1">
              <Label htmlFor="userId">Linked User</Label>
              {users.length === 0 ? (
                <p className="text-xs text-muted-foreground border rounded-md px-3 py-2">
                  No users found. Add a user first in the Users page.
                </p>
              ) : (
                <Select
                  value={userIdValue ?? ""}
                  onValueChange={(v) => setValue("userId", v ?? "")}
                >
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          — {u.email}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.userId && (
                <p className="text-xs text-destructive">{errors.userId.message}</p>
              )}
            </div>

            {/* Expiry date */}
            <div className="space-y-1">
              <Label htmlFor="expiresAt">Expiry Date</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt")} />
              {errors.expiresAt && (
                <p className="text-xs text-destructive">{errors.expiresAt.message}</p>
              )}
            </div>

            {/* Show current usedCount when editing */}
            {editing && (
              <p className="text-sm text-muted-foreground rounded-md border px-3 py-2">
                Times used so far:{" "}
                <span className="font-semibold text-foreground">{editing.usedCount}</span>
                {" "}(use the <PlusCircleIcon className="inline h-3.5 w-3.5" /> button in the table to record a use)
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save Changes" : "Add Coupon"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The coupon and its usage history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
