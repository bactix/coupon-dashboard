import { User, CreateUserInput, UpdateUserInput } from "./user.types";
import { generateId } from "@/lib/id-generator";

export class UserService {
  /**
   * Creates a new user with auto-generated start and expiry dates
   * Start date = now, Expiry date = now + 1 year
   */
  createUser(input: CreateUserInput): User {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    return {
      id: generateId(),
      ...input,
      createdAt: now.toISOString(),
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
    };
  }

  /**
   * Updates user properties (name, email, phone, password)
   * Does not modify dates or ID
   */
  updateUser(user: User, updates: UpdateUserInput): User {
    return {
      ...user,
      ...updates,
    };
  }

  /**
   * Renews a user's subscription by setting a new expiry date
   */
  renewUser(user: User, newExpiryDate: string): User {
    return {
      ...user,
      expiryDate: newExpiryDate,
    };
  }

  /**
   * Checks if a user's subscription is expired
   */
  isExpired(user: User): boolean {
    return new Date(user.expiryDate) < new Date();
  }

  /**
   * Validates user data
   */
  validateCreateInput(input: CreateUserInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.name?.trim()) errors.push("Name is required");
    if (!input.email?.includes("@")) errors.push("Valid email is required");
    if (input.password?.length < 8) errors.push("Password must be at least 8 characters");
    if (!input.phone?.match(/^\+961\s?\d[\s\d]{6,9}$/))
      errors.push("Valid Lebanese phone number required");

    return { valid: errors.length === 0, errors };
  }
}
