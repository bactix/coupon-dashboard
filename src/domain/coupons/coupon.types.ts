export interface Coupon {
  id: string;
  code: string;
  businessId: string;
  discount: number;
  description: string;
  expiryDate: string;
  totalUsageCount: number;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  businessName: string;
  discount: number;
  description: string;
  expiryDate: string;
}

export interface UpdateCouponInput {
  description?: string;
  expiryDate?: string;
}
