import { Business, CreateBusinessInput, UpdateBusinessInput, BusinessModel } from "./business.types";
import { generateId } from "@/lib/id-generator";

/** Fixed number of uses granted to every "limited" business. */
export const LIMITED_USAGE_LIMIT = 12;

export class BusinessService {
  /**
   * Creates a new business with business model configuration
   */
  createBusiness(input: CreateBusinessInput): Business {
    const now = new Date();

    return {
      id: generateId(),
      ...input,
      usageLimit: input.businessModel === "limited" ? LIMITED_USAGE_LIMIT : undefined,
      createdAt: now.toISOString(),
    };
  }

  /**
   * Updates business properties
   */
  updateBusiness(business: Business, updates: UpdateBusinessInput): Business {
    return {
      ...business,
      ...updates,
      usageLimit: updates.businessModel === "limited" ? LIMITED_USAGE_LIMIT : undefined,
    };
  }

  /**
   * Changes business model from unlimited to limited or vice versa
   */
  changBusinessModel(business: Business, newModel: BusinessModel): Business {
    return {
      ...business,
      businessModel: newModel,
      usageLimit: newModel === "limited" ? LIMITED_USAGE_LIMIT : undefined,
    };
  }

  /**
   * Checks if business has reached usage limit (if limited)
   */
  hasReachedLimit(business: Business, currentUsage: number): boolean {
    return business.businessModel === "limited" && business.usageLimit
      ? currentUsage >= business.usageLimit
      : false;
  }

  /**
   * Validates business creation input
   */
  validateCreateInput(input: CreateBusinessInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.name?.trim()) errors.push("Business name is required");
    if (input.password?.length < 8) errors.push("Password must be at least 8 characters");
    if (!input.phone?.match(/^\+961\s?\d[\s\d]{6,9}$/))
      errors.push("Valid Lebanese phone number required");
    if (!input.ownerName?.trim()) errors.push("Owner name is required");

    return { valid: errors.length === 0, errors };
  }
}
