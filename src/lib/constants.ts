import type { BusinessType, LebanesCity } from "@/types/business";

export const LEBANESE_CITIES = [
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
] as const satisfies readonly LebanesCity[];

export const BUSINESS_TYPES = [
  "restaurant",
  "hotel",
  "spa",
  "coffee shop",
  "shop",
  "activities",
  "online store",
  "gym",
] as const satisfies readonly BusinessType[];
