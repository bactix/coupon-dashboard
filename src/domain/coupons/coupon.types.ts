export interface Coupon {
  id: string;
  code: string;
  businessId: string;
  discount: number;
  description: string;
  expiryDate: string;
  maxUsagePerUser: number;
  totalUsageCount: number;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  businessName: string;
  discount: number;
  description: string;
  expiryDate: string;
  maxUsagePerUser: number;
}

export interface UpdateCouponInput {
  description?: string;
  expiryDate?: string;
  maxUsagePerUser?: number;
}
