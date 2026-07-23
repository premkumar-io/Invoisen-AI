import { clearAuth, saveAuthToken } from "./auth";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawGoogleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL?.trim();
const API_PREFIX = "/api/v1";

function normalizeApiBaseUrl(value: string) {
  return value.startsWith("http") ? value.replace(/\/$/, "") : `http://${value.replace(/^:+/, "")}`;
}

function getApiBaseUrl() {
  if (rawApiBaseUrl) {
    return normalizeApiBaseUrl(rawApiBaseUrl);
  }

  return "http://localhost:5050";
}

export type BackendError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export type BackendResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: BackendError;
    };

export function getApiUrl(path: string) {
  // In development, we use a relative path to trigger Vite's proxy.
  // The proxy is configured in `vite.config.ts` to forward `/api` requests
  // to the backend server, which avoids CORS issues.
  if (import.meta.env.DEV) {
    return `${API_PREFIX}${path}`;
  }
  return `${getApiBaseUrl()}${API_PREFIX}${path}`;
}

export function getGoogleAuthUrl() {
  return rawGoogleAuthUrl || getApiUrl("/auth/google");
}

let refreshPromise: Promise<string | null> | null = null;

const networkError = {
  success: false as const,
  error: {
    code: "NETWORK_ERROR",
    message: "Unable to reach the API. Check the backend URL, server status, and CORS settings.",
  },
};

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const rawData = (await response.json().catch(() => null)) as BackendResponse<{
        accessToken: string;
      }> | null;

      if (!response.ok || !rawData || rawData.success === false || !rawData.data?.accessToken) {
        clearAuth();
        return null;
      }

      saveAuthToken(rawData.data.accessToken);
      return rawData.data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiCall<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  body?: unknown,
  options?: { retryRefresh?: boolean; _retryToken?: string; headers?: HeadersInit },
): Promise<BackendResponse<T>> {
  const { retryRefresh = true, headers: extraHeaders } = options || {};

  const token =
    typeof window !== "undefined" ? localStorage.getItem("invoisen_access_token") : null;

  let response: Response;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string> | undefined),
  };
  const currentToken = options?._retryToken ?? token;
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }
  try {
    response = await fetch(getApiUrl(path), {
      method,
      credentials: "include",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return networkError;
  }

  const data = (await response.json().catch(() => null)) as BackendResponse<T> | null;

  if (!response.ok && response.status === 401 && retryRefresh) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return apiCall(method, path, body, { retryRefresh: false, _retryToken: newToken });
    }
  }

  if (!data) {
    return networkError;
  }

  return data;
}

export const api = {
  get: <T = unknown>(path: string) => apiCall<T>("GET", path),
  post: <T = unknown>(path: string, body?: unknown) => apiCall<T>("POST", path, body),
  put: <T = unknown>(path: string, body?: unknown) => apiCall<T>("PUT", path, body),
  patch: <T = unknown>(path: string, body?: unknown) => apiCall<T>("PATCH", path, body),
  delete: <T = unknown>(path: string) => apiCall<T>("DELETE", path),
};
