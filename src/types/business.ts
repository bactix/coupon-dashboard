export type BusinessType = "restaurant" | "hotel" | "other";
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
  email: string;
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
