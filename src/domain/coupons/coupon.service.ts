import { Coupon, CreateCouponInput, UpdateCouponInput } from "./coupon.types";

export class CouponService {
  // The API assigns id, createdAt, totalUsageCount and resolves the business
  // from `businessName`, so the create payload is just the validated input.
  createCoupon(input: CreateCouponInput): CreateCouponInput {
    return { ...input };
  }

  updateCoupon(coupon: Coupon, updates: UpdateCouponInput): Coupon {
    return {
      ...coupon,
      ...updates,
    };
  }

  isExpired(coupon: Coupon): boolean {
    return new Date(coupon.expiryDate) < new Date();
  }

  validateCreateInput(input: CreateCouponInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.code?.trim()) errors.push("Coupon code is required");
    if (input.discount <= 0 || input.discount > 100) errors.push("Discount must be 0-100");
    const expiryDate = new Date(input.expiryDate);
    if (expiryDate <= new Date()) errors.push("Expiry date must be in the future");

    return { valid: errors.length === 0, errors };
  }
}
