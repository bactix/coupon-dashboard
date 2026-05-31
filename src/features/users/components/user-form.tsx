"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserFormValues, userSchema } from "@/lib/schemas";
import { USER_FORM_DEFAULTS } from "@/features/users/constants";
import { FormField } from "@/features/businesses/components/form-field";

interface UserFormProps {
  onSubmit: (values: UserFormValues) => void;
  defaultValues?: Partial<UserFormValues>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function UserForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = "Save User",
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      ...{
        name: "",
        email: "",
        password: "",
        phone: USER_FORM_DEFAULTS.phone,
        status: "active",
      },
      ...defaultValues,
    },
  });

  const statusValue = watch("status");
  const phoneValue = watch("phone");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id="name"
        label="Full Name"
        error={errors.name}
        required
      >
        <Input
          id="name"
          placeholder="e.g. Rania Khoury"
          disabled={isLoading}
          {...register("name")}
        />
      </FormField>

      <FormField
        id="email"
        label="Email"
        error={errors.email}
        required
      >
        <Input
          id="email"
          type="email"
          placeholder="e.g. rania@example.lb"
          disabled={isLoading}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={errors.password}
        required
      >
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 characters"
          disabled={isLoading}
          {...register("password")}
        />
      </FormField>

      <FormField
        id="phone"
        label="Phone Number"
        error={errors.phone}
        required
      >
        <PhoneInput
          id="phone"
          value={phoneValue}
          onChange={(value) =>
            setValue("phone", value, { shouldValidate: true, shouldDirty: true })
          }
          disabled={isLoading}
        />
      </FormField>

      <FormField
        id="status"
        label="Status"
        error={errors.status}
        required
      >
        <Select
          value={statusValue}
          onValueChange={(value) => setValue("status", value as "active" | "inactive")}
          disabled={isLoading}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
