"use client";

import { useEffect, useState } from "react";
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
import { useCouponManager } from "@/features/coupons/hooks/useCouponManager";
import { useBusinessManager } from "@/features/businesses/hooks/useBusinessManager";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  businessName: z.string().min(1, "Business is required"),
  discount: z.number().min(0, "Discount must be at least 0").max(100, "Discount cannot exceed 100"),
  description: z.string().min(1, "Description is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),

});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function CouponsPage() {
  const { coupons, isLoading, initializeCoupons, addCoupon, updateCoupon, deleteCoupon } = useCouponManager();
  const { businesses, initializeBusinesses } = useBusinessManager();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<(typeof coupons)[0] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([initializeCoupons(), initializeBusinesses()]);
    };
    loadData();
  }, [initializeCoupons, initializeBusinesses]);

  function getDefaultExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  }

  function openCreate() {
    setEditing(null);
    reset({
      code: "",
      businessName: "",
      discount: 10,
      description: "",
      expiryDate: getDefaultExpiryDate(),
    });
    setDialogOpen(true);
  }

  function openEdit(c: (typeof coupons)[0]) {
    setEditing(c);
    reset({
      code: c.code,
      businessName: businesses.find((b) => b.id === c.businessId)?.name ?? "",
      discount: c.discount,
      description: c.description,
      expiryDate: c.expiryDate,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: CouponFormValues) {
    try {
      if (editing) {
        await updateCoupon(editing.id, {
          description: values.description,
          expiryDate: values.expiryDate,
        });
      } else {
        await addCoupon(values);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save coupon:", error);
    }
  }

  async function confirmDelete() {
    if (deleteId) {
      try {
        await deleteCoupon(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete coupon:", error);
      }
    }
  }

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

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
              Manage discount coupons
            </p>
          </div>
          <Button onClick={openCreate} disabled={isLoading}>
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

                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No coupons yet. Click "Add Coupon" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((c) => {
                  const expired = isExpired(c.expiryDate);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-semibold">
                        {c.code}
                      </TableCell>
                      <TableCell>{c.discount}%</TableCell>

                      <TableCell>
                        <Badge variant={expired ? "destructive" : "default"}>
                          {expired ? "Expired" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.expiryDate).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(c)}
                            disabled={isLoading}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(c.id)}
                            disabled={isLoading}
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
            <div className="space-y-1">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                placeholder="e.g. SAVE20"
                disabled={!!editing}
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="e.g. Joe's Cafe"
                disabled={!!editing}
                {...register("businessName")}
              />
              {errors.businessName && (
                <p className="text-xs text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                step={1}
                {...register("discount", { valueAsNumber: true })}
              />
              {errors.discount && (
                <p className="text-xs text-destructive">{errors.discount.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe this coupon..."
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register("expiryDate")}
              />
              {errors.expiryDate && (
                <p className="text-xs text-destructive">{errors.expiryDate.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editing ? "Save Changes" : "Add Coupon"}
              </Button>
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
              This action cannot be undone.
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
