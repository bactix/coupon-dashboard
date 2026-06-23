"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessFormValues, BusinessEditFormValues, businessSchema, businessEditSchema } from "@/lib/schemas";
import { Resolver } from "react-hook-form";
import { LIMITED_USAGE_LIMIT } from "@/domain/businesses/business.service";
import { LEBANESE_CITIES, BUSINESS_TYPES } from "@/lib/constants";
import { BUSINESS_TYPE_LABELS, BUSINESS_FORM_DEFAULTS } from "@/features/businesses/constants";
import { FormField } from "./form-field";

interface BusinessFormProps {
  onSubmit: (values: BusinessFormValues | BusinessEditFormValues) => void;
  defaultValues?: Partial<BusinessFormValues | BusinessEditFormValues>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditing?: boolean;
}

export function BusinessForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = "Save Business",
  isEditing = false,
}: BusinessFormProps) {
  const mergedDefaults = isEditing
    ? { name: "", type: BUSINESS_FORM_DEFAULTS.type, phone: "", ownerName: "", city: BUSINESS_FORM_DEFAULTS.city, address: "", about: "", discount: 0, status: "inactive" as const, ...defaultValues }
    : { name: "", type: BUSINESS_FORM_DEFAULTS.type, password: "", phone: "", ownerName: "", city: BUSINESS_FORM_DEFAULTS.city, address: "", about: "", discount: 0, status: "inactive" as const, ...defaultValues };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(isEditing ? businessEditSchema : businessSchema) as unknown as Resolver<BusinessFormValues>,
    defaultValues: mergedDefaults,
  });

  const typeValue = watch("type");
  const cityValue = watch("city");
  const businessModelValue = watch("businessModel");
  const statusValue = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id="name"
        label="Business Name"
        error={errors.name}
        required
      >
        <Input
          id="name"
          placeholder="e.g. Al-Falamanki"
          disabled={isLoading}
          {...register("name")}
        />
      </FormField>

      {!isEditing && (
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
      )}

      <FormField
        id="type"
        label="Business Type"
        error={errors.type}
        required
      >
        <Select
          value={typeValue}
          onValueChange={(value) => setValue("type", value as any)}
          disabled={isLoading}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {BUSINESS_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        id="city"
        label="City"
        error={errors.city}
        required
      >
        <Select
          value={cityValue}
          onValueChange={(value) => setValue("city", value as any)}
          disabled={isLoading}
        >
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
      </FormField>

      <FormField
        id="address"
        label="Address"
        error={errors.address}
        required
      >
        <Input
          id="address"
          placeholder="e.g. Hamra Street, Building 12"
          disabled={isLoading}
          {...register("address")}
        />
      </FormField>

      <FormField
        id="phone"
        label="Phone Number"
        error={errors.phone}
        required
      >
        <Input
          id="phone"
          type="tel"
          placeholder="e.g. 03123456"
          disabled={isLoading}
          {...register("phone")}
        />
      </FormField>

      <FormField
        id="ownerName"
        label="Owner Name"
        error={errors.ownerName}
        required
      >
        <Input
          id="ownerName"
          placeholder="e.g. Karim Mansour"
          disabled={isLoading}
          {...register("ownerName")}
        />
      </FormField>

      <FormField
        id="about"
        label="About"
        error={errors.about}
        required
      >
        <Textarea
          id="about"
          placeholder="Short description of the business"
          disabled={isLoading}
          {...register("about")}
        />
      </FormField>

      <FormField
        id="discount"
        label="Discount (%)"
        error={errors.discount}
        required
      >
        <Input
          id="discount"
          type="number"
          min={0}
          max={100}
          placeholder="e.g. 20"
          disabled={isLoading}
          {...register("discount", { valueAsNumber: true })}
        />
      </FormField>

      <FormField
        id="businessModel"
        label="Business Model"
        error={errors.businessModel}
        required
      >
        <Select
          value={businessModelValue}
          onValueChange={(value) => {
            setValue("businessModel", value as "unlimited" | "limited");
            setValue("usageLimit", value === "limited" ? LIMITED_USAGE_LIMIT : undefined);
          }}
          disabled={isLoading}
        >
          <SelectTrigger id="businessModel">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited">Unlimited</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {businessModelValue === "limited" && (
        <p className="text-sm text-muted-foreground">
          Limited businesses are granted{" "}
          <strong>{LIMITED_USAGE_LIMIT} uses</strong>.
        </p>
      )}

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
