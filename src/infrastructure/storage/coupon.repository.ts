import { Coupon } from "@/domain/coupons/coupon.types";

export interface ICouponRepository {
  getAll(): Promise<Coupon[]>;
  getById(id: string): Promise<Coupon | null>;
  getByBusinessId(businessId: string): Promise<Coupon[]>;
  create(coupon: Coupon): Promise<void>;
  update(id: string, coupon: Coupon): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * LocalStorage implementation of Coupon Repository
 */
export class LocalStorageCouponRepository implements ICouponRepository {
  private readonly key = "coupons";

  async getAll(): Promise<Coupon[]> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  async getById(id: string): Promise<Coupon | null> {
    const coupons = await this.getAll();
    return coupons.find((c) => c.id === id) || null;
  }

  async getByBusinessId(businessId: string): Promise<Coupon[]> {
    const coupons = await this.getAll();
    return coupons.filter((c) => c.businessId === businessId);
  }

  async create(coupon: Coupon): Promise<void> {
    const coupons = await this.getAll();
    coupons.unshift(coupon);
    localStorage.setItem(this.key, JSON.stringify(coupons));
  }

  async update(id: string, coupon: Coupon): Promise<void> {
    const coupons = await this.getAll();
    const index = coupons.findIndex((c) => c.id === id);
    if (index !== -1) {
      coupons[index] = coupon;
      localStorage.setItem(this.key, JSON.stringify(coupons));
    }
  }

  async delete(id: string): Promise<void> {
    const coupons = await this.getAll();
    const filtered = coupons.filter((c) => c.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }
}
