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
import { BusinessFormValues, businessSchema } from "@/lib/schemas";
import { LEBANESE_CITIES, BUSINESS_TYPES } from "@/lib/constants";
import { BUSINESS_TYPE_LABELS, BUSINESS_FORM_DEFAULTS } from "@/features/businesses/constants";
import { FormField } from "./form-field";

interface BusinessFormProps {
  onSubmit: (values: BusinessFormValues) => void;
  defaultValues?: Partial<BusinessFormValues>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BusinessForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = "Save Business",
}: BusinessFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      ...{
        name: "",
        type: BUSINESS_FORM_DEFAULTS.type,
        email: "",
        password: "",
        phone: BUSINESS_FORM_DEFAULTS.phone,
        ownerName: "",
        city: BUSINESS_FORM_DEFAULTS.city,
      },
      ...defaultValues,
    },
  });

  const typeValue = watch("type");
  const cityValue = watch("city");
  const businessModelValue = watch("businessModel");
  const phoneValue = watch("phone");

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

      <FormField
        id="email"
        label="Email"
        error={errors.email}
        required
      >
        <Input
          id="email"
          type="email"
          placeholder="e.g. info@business.lb"
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
        id="businessModel"
        label="Business Model"
        error={errors.businessModel}
        required
      >
        <Select
          value={businessModelValue}
          onValueChange={(value) => {
            setValue("businessModel", value as "unlimited" | "limited");
            if (value === "unlimited") setValue("usageLimit", undefined);
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
        <FormField
          id="usageLimit"
          label="Number of Uses"
          error={errors.usageLimit}
          required
        >
          <Input
            id="usageLimit"
            type="number"
            min={1}
            placeholder="e.g. 100"
            disabled={isLoading}
            {...register("usageLimit", { valueAsNumber: true })}
          />
        </FormField>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
