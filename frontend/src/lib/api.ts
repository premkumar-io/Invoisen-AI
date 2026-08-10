import { clearAuth, saveAuthToken } from "./auth";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawGoogleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL?.trim();
const API_PREFIX = "/api/v1";

const DEFAULT_PRODUCTION_API_URL = "https://invoisen-api.onrender.com";
const LOCAL_BACKEND_API_URL = "http://localhost:5050";

let dynamicDetectedBaseUrl: string | null = null;

function isProductionHost(): boolean {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

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
  if (isProductionHost()) {
    if (rawApiBaseUrl && !rawApiBaseUrl.includes("localhost") && !rawApiBaseUrl.includes("127.0.0.1")) {
      return normalizeApiBaseUrl(rawApiBaseUrl);
    }
    return DEFAULT_PRODUCTION_API_URL;
  }

  if (dynamicDetectedBaseUrl) {
    return dynamicDetectedBaseUrl;
  }
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

export function getApiUrl(path: string, overrideBaseUrl?: string) {
  const base = overrideBaseUrl || getApiBaseUrl();
  return `${base}${API_PREFIX}${path}`;
}

export function getGoogleAuthUrl() {
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://invoisen.vercel.app";
  const queryParam = `?redirect_to=${encodeURIComponent(currentOrigin)}`;

  if (isProductionHost()) {
    if (rawGoogleAuthUrl && !rawGoogleAuthUrl.includes("localhost") && !rawGoogleAuthUrl.includes("127.0.0.1")) {
      const base = normalizeApiBaseUrl(rawGoogleAuthUrl);
      return base.includes("?") ? `${base}&redirect_to=${encodeURIComponent(currentOrigin)}` : `${base}${queryParam}`;
    }
    return `${DEFAULT_PRODUCTION_API_URL}${API_PREFIX}/auth/google${queryParam}`;
  }

  let url = rawGoogleAuthUrl;
  if (url && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    url = undefined;
  }
  if (url) {
    const base = normalizeApiBaseUrl(url);
    return base.includes("?") ? `${base}&redirect_to=${encodeURIComponent(currentOrigin)}` : `${base}${queryParam}`;
  }
  return `${getApiBaseUrl()}${API_PREFIX}/auth/google${queryParam}`;
}

let pinging = false;
let isBackendAwake = false;

export function pingBackend() {
  if (isBackendAwake || pinging) return;
  pinging = true;

  let attempts = 0;
  const maxAttempts = 30;

  const doPing = async () => {
    attempts++;
    const baseUrl = getApiBaseUrl();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${baseUrl}/health`, {
        method: "GET",
        credentials: "omit",
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        isBackendAwake = true;
        pinging = false;
        return;
      }
    } catch {
      if (!isProductionHost() && baseUrl !== LOCAL_BACKEND_API_URL) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(`${LOCAL_BACKEND_API_URL}/health`, {
            method: "GET",
            credentials: "omit",
            signal: controller.signal,
          });
          clearTimeout(timer);
          if (res.ok) {
            dynamicDetectedBaseUrl = LOCAL_BACKEND_API_URL;
            isBackendAwake = true;
            pinging = false;
            return;
          }
        } catch {
          // Ignore probe error
        }
      }
    }

    if (attempts < maxAttempts && !isBackendAwake) {
      setTimeout(doPing, 2500);
    } else {
      pinging = false;
    }
  };

  doPing();
}

if (typeof window !== "undefined") {
  pingBackend();
}

let refreshPromise: Promise<string | null> | null = null;

const networkError = {
  success: false as const,
  error: {
    code: "NETWORK_ERROR",
    message:
      "Unable to reach the API server. The backend may be spinning up from sleep mode (Render free tier). Please wait a few seconds and try again.",
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
  options?: {
    retryRefresh?: boolean;
    _retryToken?: string;
    headers?: HeadersInit;
    maxRetries?: number;
  },
): Promise<BackendResponse<T>> {
  const { retryRefresh = true, headers: extraHeaders, maxRetries = 12 } = options || {};

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

  const isLocalhost = !isProductionHost();

  const delays = [1500, 2000, 3000, 4000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let targetBaseUrl = getApiBaseUrl();

    if (isLocalhost && attempt > 1 && attempt % 2 === 0 && targetBaseUrl !== LOCAL_BACKEND_API_URL) {
      targetBaseUrl = LOCAL_BACKEND_API_URL;
    }

    const apiUrl = getApiUrl(path, targetBaseUrl);

    try {
      const controller = new AbortController();
      const timeoutMs = 15000;
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      response = await fetch(apiUrl, {
        method,
        credentials: "include",
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (isLocalhost && targetBaseUrl === LOCAL_BACKEND_API_URL) {
        dynamicDetectedBaseUrl = LOCAL_BACKEND_API_URL;
      }
      isBackendAwake = true;
      break;
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = delays[attempt - 1] || 4000;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      try {
        response = await fetch(getApiUrl(path), {
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
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("invoisen_unauthorized"));
      }
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

