import { AppUser } from "@/types/user";
import { apiRequest, apiRequestPaginated, type PaginatedResult } from "@/lib/api-client";

export interface IUserRepository {
  getAll(): Promise<AppUser[]>;
  getPaginated(page: number, limit: number, status?: string): Promise<PaginatedResult<AppUser>>;
  getById(id: string): Promise<AppUser>;
  create(user: Omit<AppUser, "id" | "createdAt" | "startDate" | "expiryDate">): Promise<AppUser>;
  update(id: string, user: Partial<AppUser>): Promise<AppUser>;
  delete(id: string): Promise<void>;
}

export class ApiUserRepository implements IUserRepository {
  async getAll(): Promise<AppUser[]> {
    return apiRequest<AppUser[]>("/api/dashboard/users");
  }

  async getPaginated(
    page: number,
    limit: number,
    status?: string
  ): Promise<PaginatedResult<AppUser>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set("status", status);
    return apiRequestPaginated<AppUser>(`/api/dashboard/users?${params.toString()}`);
  }

  async getById(id: string): Promise<AppUser> {
    return apiRequest<AppUser>(`/api/dashboard/users/${id}`);
  }

  async create(user: Omit<AppUser, "id" | "createdAt" | "startDate" | "expiryDate">): Promise<AppUser> {
    return apiRequest<AppUser>("/api/dashboard/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async update(id: string, user: Partial<AppUser>): Promise<AppUser> {
    return apiRequest<AppUser>(`/api/dashboard/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  }

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/dashboard/users/${id}`, {
      method: "DELETE",
    });
  }

  async renew(id: string, expiryDate?: string, startDate?: string): Promise<AppUser> {
    const payload: { expiryDate?: string; startDate?: string } = {};
    if (startDate) payload.startDate = startDate;
    if (expiryDate) payload.expiryDate = expiryDate;
    return apiRequest<AppUser>(`/api/dashboard/users/${id}/renew`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
