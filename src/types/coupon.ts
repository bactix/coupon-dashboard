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
