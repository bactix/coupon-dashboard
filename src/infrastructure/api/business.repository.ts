import { Business } from "@/types/business";
import { apiRequest, apiUpload } from "@/lib/api-client";

export interface IBusinessRepository {
  getAll(): Promise<Business[]>;
  getById(id: string): Promise<Business>;
  create(business: Omit<Business, "id" | "createdAt">): Promise<Business>;
  update(id: string, business: Partial<Business>): Promise<Business>;
  delete(id: string): Promise<void>;
  uploadProfilePicture(id: string, file: File): Promise<Business>;
  uploadGallery(id: string, files: File[]): Promise<Business>;
  removeGalleryImage(id: string, index: number): Promise<Business>;
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

  async uploadProfilePicture(id: string, file: File): Promise<Business> {
    const form = new FormData();
    form.append("profilePicture", file);
    return apiUpload<Business>(`/api/dashboard/businesses/${id}/profile-picture`, form);
  }

  async uploadGallery(id: string, files: File[]): Promise<Business> {
    const form = new FormData();
    files.forEach((f) => form.append("gallery", f));
    return apiUpload<Business>(`/api/dashboard/businesses/${id}/gallery`, form);
  }

  async removeGalleryImage(id: string, index: number): Promise<Business> {
    return apiRequest<Business>(`/api/dashboard/businesses/${id}/gallery/${index}`, {
      method: "DELETE",
    });
  }
}
