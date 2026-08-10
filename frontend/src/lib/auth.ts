export type StoredUser = {
  _id: string;
  fullName: string;
  displayName?: string;
  email: string;
  avatar?: string | null;
  phone?: string;
  phoneVerified?: boolean;
  timeZone?: string;
  language?: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "enterprise";
  country?: string;
  emailVerified: boolean;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
};

const TOKEN_KEY = "invoisen_access_token";
const USER_KEY = "invoisen_user";

export function cleanupExcessLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("invoisen_user_avatar") ||
          (k.startsWith("invoisen_") && k !== TOKEN_KEY && k !== USER_KEY && k !== "invoisen_theme"))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("Failed to cleanup localStorage:", e);
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage.setItem failed for key "${key}":`, e);
    cleanupExcessLocalStorage();
    try {
      localStorage.setItem(key, value);
    } catch {
      if (key === USER_KEY) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.avatar) {
            delete parsed.avatar;
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch {}
      }
    }
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveAuthToken(token: string) {
  safeSetItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function saveUser(user: StoredUser) {
  const userToSave = { ...user };
  if (userToSave.avatar && userToSave.avatar.length > 2000) {
    delete userToSave.avatar;
  }
  safeSetItem(USER_KEY, JSON.stringify(userToSave));
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

import { resetThemeOnLogout } from "./theme";

export function clearUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function clearAuth() {
  clearAuthToken();
  clearUser();
  resetThemeOnLogout();
}
