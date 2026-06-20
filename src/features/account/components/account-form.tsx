"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/features/businesses/components/form-field";
import { useAccount } from "@/features/account/hooks/use-account";

const accountSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    // Password is optional — leave blank to keep the current one.
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: "custom",
          message: "Password must be at least 8 characters",
          path: ["password"],
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    }
  });

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountForm() {
  const { currentUser, updateAccount, isLoading, error, success } = useAccount();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      password: "",
      confirmPassword: "",
    },
  });

  const phoneValue = watch("phone");

  function onSubmit(values: AccountFormValues) {
    updateAccount({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password || undefined,
    });
    // Keep the profile fields, only clear the password inputs.
    reset({ ...values, password: "", confirmPassword: "" });
  }

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Please log in to access account settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Update your email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Account updated successfully!
            </div>
          )}

          <FormField
            id="name"
            label="Full Name"
            error={errors.name}
            required
          >
            <Input
              id="name"
              placeholder="Your name"
              disabled={isLoading}
              {...register("name")}
            />
          </FormField>

          <FormField
            id="email"
            label="Email Address"
            error={errors.email}
            required
          >
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              disabled={isLoading}
              {...register("email")}
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

          <div className="space-y-4">
            <h3 className="font-semibold">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Leave blank to keep your current password.
            </p>

            <FormField
              id="password"
              label="New Password"
              error={errors.password}
            >
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                disabled={isLoading}
                {...register("password")}
              />
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              error={errors.confirmPassword}
            >
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
            </FormField>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Show password
            </label>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
