import { Business, CreateBusinessInput, UpdateBusinessInput, BusinessModel } from "./business.types";
import { generateId } from "@/lib/id-generator";

export class BusinessService {
  /**
   * Creates a new business with business model configuration
   */
  createBusiness(input: CreateBusinessInput): Business {
    const now = new Date();

    return {
      id: generateId(),
      ...input,
      usageLimit: input.businessModel === "limited" ? input.usageLimit : undefined,
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
      usageLimit: updates.businessModel === "limited" ? updates.usageLimit : undefined,
    };
  }

  /**
   * Changes business model from unlimited to limited or vice versa
   */
  changBusinessModel(
    business: Business,
    newModel: BusinessModel,
    usageLimit?: number
  ): Business {
    return {
      ...business,
      businessModel: newModel,
      usageLimit: newModel === "limited" ? usageLimit : undefined,
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
    if (!input.email?.includes("@")) errors.push("Valid email is required");
    if (input.password?.length < 8) errors.push("Password must be at least 8 characters");
    if (!input.phone?.match(/^\+961\s?\d[\s\d]{6,9}$/))
      errors.push("Valid Lebanese phone number required");
    if (!input.ownerName?.trim()) errors.push("Owner name is required");
    if (input.businessModel === "limited" && !input.usageLimit)
      errors.push("Usage limit required for limited model");

    return { valid: errors.length === 0, errors };
  }
}
