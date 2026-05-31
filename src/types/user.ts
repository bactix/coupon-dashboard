export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
  startDate: string;
  expiryDate: string;
}
