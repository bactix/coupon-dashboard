const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "auth-token";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

async function rawRequest(path: string, options?: RequestInit): Promise<any> {
  const url = new URL(path, API_URL).toString();
  const token = getToken();

  const headers = new Headers(options?.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const message = body?.error || response.statusText;
    throw new ApiError(response.status, message, body);
  }

  return response.json();
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const json = await rawRequest(path, options);

  // Handle different response wrapping structures:
  // 1. Direct: [...] or {...}
  // 2. Wrapped: { data: [...], pagination: {...} }
  // 3. Double-wrapped: { success: true, data: { data: [...], pagination: {...} } }
  // 4. With success flag: { success: true, data: [...] }
  if (json && typeof json === "object") {
    // If response has nested data structure
    if (json.data !== undefined) {
      // Check for double-wrapping
      if (json.data && typeof json.data === "object" && json.data.data !== undefined) {
        return json.data.data;
      }
      return json.data;
    }
  }

  return json;
}

/**
 * Like apiRequest, but preserves the `{ data, pagination }` envelope used by
 * paginated list endpoints (instead of unwrapping down to the array).
 */
export async function apiRequestPaginated<T>(
  path: string,
  options?: RequestInit
): Promise<PaginatedResult<T>> {
  const json = await rawRequest(path, options);

  // The payload holding `{ data, pagination }` may be at the top level or
  // nested under a `success`/`data` envelope from ResponseHelper.
  const payload =
    json && typeof json === "object" && json.data !== undefined ? json.data : json;

  const data: T[] = Array.isArray(payload?.data) ? payload.data : [];
  const pagination: Pagination = payload?.pagination ?? {
    page: 1,
    limit: data.length,
    total: data.length,
    pages: 1,
  };

  return { data, pagination };
}
