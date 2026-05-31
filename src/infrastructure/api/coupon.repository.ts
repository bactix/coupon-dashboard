import { Coupon } from "@/types/coupon";
import { CreateCouponInput } from "@/domain/coupons/coupon.types";
import { apiRequest } from "@/lib/api-client";

export interface ICouponRepository {
  getAll(): Promise<Coupon[]>;
  getById(id: string): Promise<Coupon>;
  getByBusinessId(businessId: string): Promise<Coupon[]>;
  create(coupon: CreateCouponInput): Promise<Coupon>;
  update(id: string, coupon: Partial<Coupon>): Promise<Coupon>;
  delete(id: string): Promise<void>;
}

export class ApiCouponRepository implements ICouponRepository {
  async getAll(): Promise<Coupon[]> {
    return apiRequest<Coupon[]>("/api/dashboard/coupons");
  }

  async getById(id: string): Promise<Coupon> {
    return apiRequest<Coupon>(`/api/dashboard/coupons/${id}`);
  }

  async getByBusinessId(businessId: string): Promise<Coupon[]> {
    const allCoupons = await this.getAll();
    return allCoupons.filter(c => c.businessId === businessId);
  }

  async create(coupon: CreateCouponInput): Promise<Coupon> {
    return apiRequest<Coupon>("/api/dashboard/coupons", {
      method: "POST",
      body: JSON.stringify(coupon),
    });
  }

  async update(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
    return apiRequest<Coupon>(`/api/dashboard/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(coupon),
    });
  }

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/dashboard/coupons/${id}`, {
      method: "DELETE",
    });
  }

  async use(couponId: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/dashboard/coupons/${couponId}/use`, {
      method: "POST",
    });
  }
}
