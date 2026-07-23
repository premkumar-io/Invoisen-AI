export type StoredUser = {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "enterprise";
  country?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

const TOKEN_KEY = "invoisen_access_token";
const USER_KEY = "invoisen_user";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function clearAuth() {
  clearAuthToken();
  clearUser();
}
