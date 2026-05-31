import { z } from "zod";
import {
  LEBANESE_CITIES,
  BUSINESS_TYPES,
} from "@/lib/constants";

// Auth
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// User
export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+\d{1,4}\s\d{6,12}$/,
      "Enter a valid phone number (e.g. +961 03395854)"
    ),
  status: z.enum(["active", "inactive"], { message: "Select a status" }),
});

export type UserFormValues = z.infer<typeof userSchema>;

// Business
export const businessSchema = z
  .object({
    name: z.string().min(1, "Business name is required"),
    type: z.enum(BUSINESS_TYPES),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+961\s?\d[\s\d]{6,9}$/, "Enter a valid Lebanese number (+961 ...)"),
    ownerName: z.string().min(1, "Owner name is required"),
    city: z.enum(LEBANESE_CITIES),
    businessModel: z.enum(["unlimited", "limited"] as const),
    usageLimit: z.number().int().min(1, "Must be at least 1").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.businessModel === "limited" && !data.usageLimit) {
      ctx.addIssue({
        code: "custom",
        message: "Number of uses is required",
        path: ["usageLimit"],
      });
    }
  });

export type BusinessFormValues = z.infer<typeof businessSchema>;
