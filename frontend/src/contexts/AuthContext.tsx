"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { getPostHogClient } from "@/lib/posthog";
import type { User, RegisterRequest, LoginRequest } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (
    req: RegisterRequest
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (
    code: string,
    state: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "algopatterns_access_token";
const OAUTH_STATE_KEY = "algopatterns_oauth_state";

// skipcq: JS-0067
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success) {
        setUser(response.data);
        const posthog = getPostHogClient();
        if (posthog && response.data?.id) {
          posthog.identify(response.data.id);
        }
      } else {
        setUser(null);
        apiClient.setAccessToken(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch {
      setUser(null);
      apiClient.setAccessToken(null);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (storedToken) {
        apiClient.setAccessToken(storedToken);
        await refreshUser();
      } else {
        const newToken = await apiClient.refreshToken();
        if (newToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
          await refreshUser();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = useCallback(async (req: LoginRequest) => {
    try {
      const response = await apiClient.login(req);
      if (response.success) {
        setUser(response.data.user);
        const posthog = getPostHogClient();
        if (posthog && response.data.user.id) {
          posthog.identify(response.data.user.id);
        }
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
        return { success: true };
      }
      return {
        success: false,
        error: response.error?.message || "Login failed",
      };
    } catch {
      return { success: false, error: "An error occurred during login" };
    }
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    try {
      const response = await apiClient.register(req);
      if (response.success) {
        setUser(response.data.user);
        const posthog = getPostHogClient();
        if (posthog && response.data.user.id) {
          posthog.identify(response.data.user.id);
          posthog.capture("user_signed_up", { method: "email" });
        }
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
        return { success: true };
      }
      return {
        success: false,
        error: response.error?.message || "Registration failed",
      };
    } catch {
      return { success: false, error: "An error occurred during registration" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      apiClient.setAccessToken(null);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      const posthog = getPostHogClient();
      if (posthog) {
        posthog.reset();
      }
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const response = await apiClient.getGoogleAuthURL();
      if (response.success) {
        localStorage.setItem(OAUTH_STATE_KEY, response.data.state);
        window.location.href = response.data.url;
      }
    } catch {
      console.error("Failed to get Google auth URL");
    }
  }, []);

  const handleGoogleCallback = useCallback(
    async (code: string, state: string) => {
      try {
        const savedState = localStorage.getItem(OAUTH_STATE_KEY);
        if (state !== savedState) {
          return {
            success: false,
            error: "Invalid OAuth state. Please try again.",
          };
        }
        localStorage.removeItem(OAUTH_STATE_KEY);

        const response = await apiClient.googleCallback({ code, state });
        if (response.success) {
          setUser(response.data.user);
          const posthog = getPostHogClient();
          if (posthog && response.data.user.id) {
            posthog.identify(response.data.user.id);
            posthog.capture("user_signed_up", { method: "google" });
          }
          localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
          return { success: true };
        }
        return {
          success: false,
          error: response.error?.message || "Google login failed",
        };
      } catch {
        return {
          success: false,
          error: "An error occurred during Google login",
        };
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        loginWithGoogle,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
