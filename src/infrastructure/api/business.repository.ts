import { Business } from "@/types/business";
import { apiRequest } from "@/lib/api-client";

export interface IBusinessRepository {
  getAll(): Promise<Business[]>;
  getById(id: string): Promise<Business>;
  create(business: Omit<Business, "id" | "createdAt">): Promise<Business>;
  update(id: string, business: Partial<Business>): Promise<Business>;
  delete(id: string): Promise<void>;
}

export class ApiBusinessRepository implements IBusinessRepository {
  async getAll(): Promise<Business[]> {
    return apiRequest<Business[]>("/api/dashboard/businesses");
  }

  async getById(id: string): Promise<Business> {
    return apiRequest<Business>(`/api/dashboard/businesses/${id}`);
  }

  async create(business: Omit<Business, "id" | "createdAt">): Promise<Business> {
    return apiRequest<Business>("/api/dashboard/businesses", {
      method: "POST",
      body: JSON.stringify(business),
    });
  }

  async update(id: string, business: Partial<Business>): Promise<Business> {
    return apiRequest<Business>(`/api/dashboard/businesses/${id}`, {
      method: "PUT",
      body: JSON.stringify(business),
    });
  }

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/dashboard/businesses/${id}`, {
      method: "DELETE",
    });
  }
}
