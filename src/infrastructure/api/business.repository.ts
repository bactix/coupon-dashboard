import { Business } from "@/types/business";
import { apiRequest, apiRequestPaginated, apiUpload } from "@/lib/api-client";

const MAX_PAGE_SIZE = 100;

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
    // The backend paginates this endpoint (default limit 20), so a plain
    // request only returns the first page. Walk every page to get the
    // full list, since the dashboard paginates client-side instead.
    const first = await apiRequestPaginated<Business>(
      `/api/dashboard/businesses?limit=${MAX_PAGE_SIZE}`
    );
    const businesses = [...first.data];

    for (let page = 2; page <= first.pagination.pages; page++) {
      const next = await apiRequestPaginated<Business>(
        `/api/dashboard/businesses?page=${page}&limit=${MAX_PAGE_SIZE}`
      );
      businesses.push(...next.data);
    }

    return businesses;
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
