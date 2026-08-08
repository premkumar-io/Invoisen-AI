import { clearAuth, saveAuthToken } from "./auth";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawGoogleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL?.trim();
const API_PREFIX = "/api/v1";

const DEFAULT_PRODUCTION_API_URL = "https://invoisen-api.onrender.com";

function normalizeApiBaseUrl(value: string) {
  let val = value.trim();
  if (!val) return DEFAULT_PRODUCTION_API_URL;
  if (!val.startsWith("http://") && !val.startsWith("https://")) {
    val = `https://${val.replace(/^:+/, "")}`;
  }
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    val.startsWith("http://") &&
    !val.includes("localhost") &&
    !val.includes("127.0.0.1")
  ) {
    val = val.replace(/^http:\/\//, "https://");
  }
  return val.replace(/\/$/, "");
}

function getApiBaseUrl() {
  if (rawApiBaseUrl) {
    return normalizeApiBaseUrl(rawApiBaseUrl);
  }
  return DEFAULT_PRODUCTION_API_URL;
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
  const base = getApiBaseUrl();
  return `${base}${API_PREFIX}${path}`;
}

export function getGoogleAuthUrl() {
  if (rawGoogleAuthUrl) {
    return rawGoogleAuthUrl;
  }
  return `${getApiBaseUrl()}${API_PREFIX}/auth/google`;
}

let pinged = false;
export function pingBackend() {
  if (pinged) return;
  pinged = true;
  fetch(`${getApiBaseUrl()}/health`, { method: "GET", credentials: "omit" }).catch(() => {});
}

if (typeof window !== "undefined") {
  // Fire background health ping immediately on app load to wake up sleeping Render backend
  pingBackend();
}

let refreshPromise: Promise<string | null> | null = null;

const networkError = {
  success: false as const,
  error: {
    code: "NETWORK_ERROR",
    message: "Unable to reach the API server. The backend may be spinning up from sleep mode (Render free tier). Please try again in a few seconds.",
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
  options?: { retryRefresh?: boolean; _retryToken?: string; headers?: HeadersInit; maxRetries?: number },
): Promise<BackendResponse<T>> {
  const { retryRefresh = true, headers: extraHeaders, maxRetries = 3 } = options || {};

  const token =
    typeof window !== "undefined" ? localStorage.getItem("invoisen_access_token") : null;

  let response: Response | null = null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string> | undefined),
  };
  const currentToken = options?._retryToken ?? token;
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }
  const apiUrl = getApiUrl(path);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      response = await fetch(apiUrl, {
        method,
        credentials: "include",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      break; // Success fetching HTTP response
    } catch (err) {
      if (attempt < maxRetries) {
        // Wait 1.5s, 3s for cold-starting backend
        await new Promise((res) => setTimeout(res, attempt * 1500));
        continue;
      }
      try {
        response = await fetch(apiUrl, {
          method,
          credentials: "same-origin",
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        break;
      } catch (fallbackErr) {
        console.error("API Call error after retries:", err, fallbackErr);
        return networkError;
      }
    }
  }

  if (!response) {
    return networkError;
  }

  const data = (await response.json().catch(() => null)) as BackendResponse<T> | null;

  const isAuthRoute =
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh") ||
    path.includes("/auth/forgot-password") ||
    path.includes("/auth/reset-password");

  if (!response.ok && response.status === 401 && retryRefresh && !isAuthRoute) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return apiCall(method, path, body, { retryRefresh: false, _retryToken: newToken });
    }
  }

  if (!data) {
    return {
      success: false,
      error: {
        code: `HTTP_${response.status}`,
        message: response.statusText || "An unexpected error occurred. Please try again.",
      },
    };
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

export async function fetchActiveSessions() {
  const res = await api.get<{ id: string; device: string; browser: string; ip: string; location: string; current: boolean }[]>("/auth/sessions");
  return res.success ? res.data : [];
}

export async function revokeActiveSession(sessionId: string) {
  const res = await api.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  return res;
}
