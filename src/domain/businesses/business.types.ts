export type BusinessType = "restaurant" | "hotel" | "spa" | "coffee shop" | "activity" | "other";
export type BusinessModel = "unlimited" | "limited";
export type LebanesCity =
  | "Beirut"
  | "Tripoli"
  | "Sidon"
  | "Tyre"
  | "Zahle"
  | "Jounieh"
  | "Baalbek"
  | "Nabatieh"
  | "Byblos"
  | "Aley"
  | "Chouf"
  | "Bint Jbeil";

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  password: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  address: string;
  about: string;
  discount: number;
  createdAt: string;
  businessModel: BusinessModel;
  usageLimit?: number;
}

export interface CreateBusinessInput {
  name: string;
  type: BusinessType;
  password: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  address: string;
  about: string;
  discount: number;
  businessModel: BusinessModel;
  usageLimit?: number;
}

export interface UpdateBusinessInput {
  name?: string;
  type?: BusinessType;
  password?: string;
  phone?: string;
  ownerName?: string;
  city?: LebanesCity;
  address?: string;
  about?: string;
  discount?: number;
  businessModel?: BusinessModel;
  usageLimit?: number;
}

export interface BusinessFilters {
  searchTerm?: string;
  type?: BusinessType;
  city?: LebanesCity;
  model?: BusinessModel;
}
