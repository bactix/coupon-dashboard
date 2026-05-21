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
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";

type BusinessType = "restaurant" | "hotel" | "other";

const LEBANESE_CITIES = [
  "Beirut",
  "Tripoli",
  "Sidon",
  "Tyre",
  "Zahle",
  "Jounieh",
  "Baalbek",
  "Nabatieh",
  "Byblos",
  "Aley",
  "Chouf",
  "Bint Jbeil",
] as const;

type LebanesCity = (typeof LEBANESE_CITIES)[number];

interface Business {
  id: string;
  name: string;
  type: BusinessType;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  createdAt: string;
}

const schema = z.object({
  name: z.string().min(1, "Business name is required"),
  type: z.enum(["restaurant", "hotel", "other"] as const),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+961\s?\d[\s\d]{6,9}$/, "Enter a valid Lebanese number (+961 ...)"),
  ownerName: z.string().min(1, "Owner name is required"),
  city: z.enum(LEBANESE_CITIES),
});

type FormValues = z.infer<typeof schema>;

const typeVariant: Record<BusinessType, "default" | "secondary" | "outline"> = {
  restaurant: "default",
  hotel: "secondary",
  other: "outline",
};

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useLocalStorage<Business[]>("businesses", []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Business | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const typeValue = watch("type");
  const cityValue = watch("city");

  function openCreate() {
    setEditing(null);
    reset({ name: "", type: "restaurant", phone: "+961 ", ownerName: "", city: "Beirut" });
    setDialogOpen(true);
  }

  function openEdit(b: Business) {
    setEditing(b);
    reset({ name: b.name, type: b.type, phone: b.phone, ownerName: b.ownerName, city: b.city });
    setDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editing) {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === editing.id ? { ...b, ...values } : b))
      );
    } else {
      setBusinesses((prev) => [
        {
          id: Math.random().toString(36).slice(2),
          ...values,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setDialogOpen(false);
  }

  function confirmDelete() {
    if (deleteId) {
      setBusinesses((prev) => prev.filter((b) => b.id !== deleteId));
      setDeleteId(null);
    }
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
                <BreadcrumbPage>Businesses</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Businesses</h1>
            <p className="text-sm text-muted-foreground">Manage registered businesses in Lebanon</p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Business
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No businesses registered yet. Click &quot;Add Business&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>
                      <Badge variant={typeVariant[b.type]} className="capitalize">
                        {b.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{b.city}</TableCell>
                    <TableCell className="font-mono text-sm">{b.phone}</TableCell>
                    <TableCell>{b.ownerName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(b.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Business" : "Add Business"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Business Name</Label>
              <Input id="name" placeholder="e.g. Al-Falamanki" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="type">Business Type</Label>
              <Select value={typeValue} onValueChange={(v) => setValue("type", v as BusinessType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Select value={cityValue} onValueChange={(v) => setValue("city", v as LebanesCity)}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {LEBANESE_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+961 71 123 456" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input id="ownerName" placeholder="e.g. Karim Mansour" {...register("ownerName")} />
              {errors.ownerName && (
                <p className="text-xs text-destructive">{errors.ownerName.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save Changes" : "Add Business"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The business will be permanently removed.
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
