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
  phone: z.string().min(1, "Phone number is required"),
  status: z.enum(["active", "inactive"], { message: "Select a status" }),
  startDate: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const userEditSchema = userSchema.omit({ password: true });
export type UserEditFormValues = z.infer<typeof userEditSchema>;

export const changePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Business
export const businessSchema = z
  .object({
    name: z.string().min(1, "Business name is required"),
    type: z.enum(BUSINESS_TYPES),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z
      .string()
      .regex(/^(03|70|71|72|73|76|78|79|81)\d{6}$/, "Must be 8 digits starting with 03, 70–73, 76, 78, 79, or 81"),
    ownerName: z.string().min(1, "Owner name is required"),
    city: z.enum(LEBANESE_CITIES),
    address: z.string().min(1, "Address is required"),
    about: z.string().min(1, "About is required"),
    discount: z
      .number({ message: "Discount is required" })
      .min(0, "Discount must be at least 0")
      .max(100, "Discount cannot exceed 100"),
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
