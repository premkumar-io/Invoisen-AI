import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, getUser, saveAuthToken, saveUser, StoredUser, clearAuth, cleanupExcessLocalStorage } from "./auth";
import { api, apiCall } from "./api";

interface AuthContextType {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    country?: string,
  ) => Promise<{ user?: StoredUser; verificationUrl?: string }>;
  logout: () => Promise<void>;
  handleGoogleCallback: (token: string) => Promise<void>;
  updateProfile: (payload: {
    fullName?: string;
    displayName?: string;
    email?: string;
    avatar?: string | null;
    phone?: string;
    phoneVerified?: boolean;
    timeZone?: string;
    language?: string;
    plan?: "free" | "pro" | "enterprise";
  }) => Promise<StoredUser>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword?: string, newPassword?: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up storage and bootstrap auth state
    cleanupExcessLocalStorage();
    const storedToken = getAuthToken();
    const storedUser = getUser();
    setToken(storedToken);
    setUser(storedUser);
    // If we have a token but no user, fetch user profile
    if (storedToken && !storedUser) {
      api.get<StoredUser>('/users/me')
        .then((res) => {
          if (res.success) {
            saveUser(res.data);
            setUser(res.data);
          }
        })
        .catch(() => {
          // If fetching fails, clear auth to avoid stale state
          clearAuth();
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      clearAuth();
      setToken(null);
      setUser(null);
    };
    window.addEventListener("invoisen_unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("invoisen_unauthorized", handleUnauthorized);
    };
  }, []);



  const login = async (email: string, password: string) => {
    const response = await api.post<{ user: StoredUser; accessToken: string }>("/auth/login", {
      email,
      password,
    });

    if (!response.success) {
      throw new Error(response.error.message || "Login failed");
    }

    saveAuthToken(response.data.accessToken);
    saveUser(response.data.user);
    setToken(response.data.accessToken);
    setUser(response.data.user);
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    country?: string,
  ) => {
    const response = await api.post<{ user: StoredUser; accessToken?: string; verificationUrl?: string }>(
      "/auth/register",
      {
        fullName,
        email,
        password,
        phone,
        country,
      },
    );

    if (!response.success) {
      throw new Error(response.error.message || "Signup failed");
    }

    if (response.data.accessToken && response.data.user) {
      saveAuthToken(response.data.accessToken);
      saveUser(response.data.user);
      setToken(response.data.accessToken);
      setUser(response.data.user);
    }

    return { user: response.data.user, verificationUrl: response.data.verificationUrl };
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => null);
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const handleGoogleCallback = async (accessToken: string) => {
    saveAuthToken(accessToken);
    setToken(accessToken);

    const response = await apiCall<StoredUser>("GET", "/users/me", undefined, {
      _retryToken: accessToken,
    });

    if (!response.success) {
      clearAuth();
      setToken(null);
      setUser(null);
      throw new Error(response.error.message || "Failed to fetch user data");
    }

    saveUser(response.data);
    setUser(response.data);
  };

  const updateProfile = async (payload: {
    fullName?: string;
    displayName?: string;
    email?: string;
    avatar?: string | null;
    phone?: string;
    phoneVerified?: boolean;
    timeZone?: string;
    language?: string;
    plan?: "free" | "pro" | "enterprise";
  }) => {
    const response = await api.patch<StoredUser>("/users/me", payload);

    if (!response.success) {
      const err = response.error;
      const fieldDetails = err.fields ? Object.entries(err.fields).map(([k, v]) => `${k}: ${(v as any).join(", ")}`).join("; ") : "";
      throw new Error(fieldDetails || err.message || "Failed to update profile");
    }

    saveUser(response.data);
    setUser(response.data);
    return response.data;
  };

  const changePassword = async (currentPassword?: string, newPassword?: string) => {
    const response = await api.post<{ message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    if (!response.success) {
      throw new Error(response.error.message || "Failed to update password");
    }
  };

  const refreshUser = async () => {
    const response = await api.get<StoredUser>("/users/me");
    if (response.success && response.data) {
      saveUser(response.data);
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        handleGoogleCallback,
        updateProfile,
        refreshUser,
        changePassword,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      token: null,
      isLoading: false,
      login: async () => {},
      signup: async () => ({ verificationUrl: undefined }),
      logout: async () => {},
      handleGoogleCallback: async () => {},
      updateProfile: async () => ({}) as StoredUser,
      refreshUser: async () => {},
      changePassword: async () => {},
      isAuthenticated: false,
    };
  }
  return context;
}
