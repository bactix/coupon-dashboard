/**
 * Generate a unique ID suitable for database operations
 * Uses crypto.getRandomValues for better randomness than Math.random()
 */
export function generateId(): string {
  if (typeof window === "undefined") {
    return Math.random().toString(36).slice(2, 11);
  }

  try {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    return Math.random().toString(36).slice(2, 11);
  }
}
