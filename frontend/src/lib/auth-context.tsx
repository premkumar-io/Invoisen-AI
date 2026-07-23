import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, getUser, saveAuthToken, saveUser, StoredUser, clearAuth } from "./auth";
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
    country?: string,
  ) => Promise<{ verificationUrl?: string }>;
  logout: () => Promise<void>;
  handleGoogleCallback: (token: string) => Promise<void>;
  updateProfile: (payload: { fullName?: string; email?: string }) => Promise<StoredUser>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const storedToken = getAuthToken();
    const storedUser = getUser();
    setToken(storedToken);
    setUser(storedUser);
    setIsLoading(false);
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

  const signup = async (fullName: string, email: string, password: string, country?: string) => {
    const response = await api.post<{ user: StoredUser; verificationUrl?: string }>(
      "/auth/register",
      {
        fullName,
        email,
        password,
        country,
      },
    );

    if (!response.success) {
      throw new Error(response.error.message || "Signup failed");
    }

    return { verificationUrl: response.data.verificationUrl };
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

  const updateProfile = async (payload: { fullName?: string; email?: string }) => {
    const response = await api.patch<StoredUser>("/users/me", payload);

    if (!response.success) {
      throw new Error(response.error.message || "Failed to update profile");
    }

    saveUser(response.data);
    setUser(response.data);
    return response.data;
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
      signup: async () => ({}),
      logout: async () => {},
      handleGoogleCallback: async () => {},
      updateProfile: async () => ({} as StoredUser),
      isAuthenticated: false,
    };
  }
  return context;
}
