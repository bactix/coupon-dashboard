import { Business } from "@/domain/businesses/business.types";

export interface IBusinessRepository {
  getAll(): Promise<Business[]>;
  getById(id: string): Promise<Business | null>;
  create(business: Business): Promise<void>;
  update(id: string, business: Business): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * LocalStorage implementation of Business Repository
 */
export class LocalStorageBusinessRepository implements IBusinessRepository {
  private readonly key = "businesses";

  async getAll(): Promise<Business[]> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  async getById(id: string): Promise<Business | null> {
    const businesses = await this.getAll();
    return businesses.find((b) => b.id === id) || null;
  }

  async create(business: Business): Promise<void> {
    const businesses = await this.getAll();
    businesses.unshift(business);
    localStorage.setItem(this.key, JSON.stringify(businesses));
  }

  async update(id: string, business: Business): Promise<void> {
    const businesses = await this.getAll();
    const index = businesses.findIndex((b) => b.id === id);
    if (index !== -1) {
      businesses[index] = business;
      localStorage.setItem(this.key, JSON.stringify(businesses));
    }
  }

  async delete(id: string): Promise<void> {
    const businesses = await this.getAll();
    const filtered = businesses.filter((b) => b.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }
}
