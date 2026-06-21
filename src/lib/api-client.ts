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

/**
 * Decodes a JWT payload without verifying its signature (which can only happen
 * server-side). Returns null if the token is malformed.
 */
function decodeTokenPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true only when a well-formed, unexpired token is stored. Used to gate
 * access to the dashboard so expired/tampered tokens send the user to login.
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeTokenPayload(token);
  if (!payload) return false;

  const exp = payload.exp;
  if (typeof exp === "number" && Date.now() >= exp * 1000) {
    return false;
  }

  return true;
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

    // If the server rejects our token, drop it and send the user to login.
    // Only do this when a token was actually sent, so failed login attempts
    // (which have no token yet) still surface their error message normally.
    if (
      (response.status === 401 || response.status === 403) &&
      token &&
      typeof window !== "undefined"
    ) {
      clearToken();
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }

    const message = body?.error || response.statusText;
    throw new ApiError(response.status, message, body);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
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
