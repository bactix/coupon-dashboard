export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  startDate: string;
  expiryDate: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  status: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  startDate?: string;
}

export interface UserFilters {
  searchTerm?: string;
}
