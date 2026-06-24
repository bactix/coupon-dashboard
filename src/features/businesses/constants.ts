import type { BusinessType } from "@/types/business";

export const BUSINESS_TYPE_VARIANT: Record<BusinessType, "default" | "secondary" | "outline"> = {
  restaurant: "default",
  hotel: "secondary",
  spa: "default",
  "coffee shop": "secondary",
  shop: "default",
  activities: "outline",
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  spa: "Spa",
  "coffee shop": "Coffee Shop",
  shop: "Shop",
  activities: "Activities",
};

export const BUSINESS_EMPTY_STATE = {
  title: "No businesses registered yet",
  description: "Click 'Add Business' to get started.",
};

export const BUSINESS_FORM_DEFAULTS = {
  phone: "",
  city: "Beirut" as const,
  type: "restaurant" as const,
  businessModel: "unlimited" as const,
};
