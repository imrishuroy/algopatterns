import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import type { User } from "@/types";

vi.mock("@/lib/api", () => ({
  apiClient: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    refreshToken: vi.fn(),
    setAccessToken: vi.fn(),
    getGoogleAuthURL: vi.fn(),
    googleCallback: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";

const mockUser: User = {
  id: "user-123",
  email: "test@test.com",
  name: "Test User",
  emailVerified: true,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    vi.mocked(apiClient.getMe).mockResolvedValue({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    } as never);
    vi.mocked(apiClient.refreshToken).mockResolvedValue(null);
  });

  describe("initial state", () => {
    it("should start with loading state", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should return null user when not authenticated", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      vi.mocked(apiClient.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          accessToken: "access-token-123",
          expiresIn: 900,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: Awaited<ReturnType<typeof result.current.login>> = {
        success: false,
      };
      await act(async () => {
        loginResult = await result.current.login({
          email: "test@test.com",
          password: "password123",
        });
      });

      expect(loginResult.success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "algopatterns_access_token",
        "access-token-123"
      );
    });

    it("should handle login failure", async () => {
      vi.mocked(apiClient.login).mockResolvedValue({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: Awaited<ReturnType<typeof result.current.login>> = {
        success: false,
      };
      await act(async () => {
        loginResult = await result.current.login({
          email: "test@test.com",
          password: "wrongpassword",
        });
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe("Invalid credentials");
      expect(result.current.user).toBeNull();
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      vi.mocked(apiClient.register).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          accessToken: "access-token-123",
          expiresIn: 900,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let registerResult: Awaited<ReturnType<typeof result.current.register>> =
        { success: false };
      await act(async () => {
        registerResult = await result.current.register({
          email: "test@test.com",
          password: "password123",
          name: "Test User",
        });
      });

      expect(registerResult.success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it("should handle registration failure for existing email", async () => {
      vi.mocked(apiClient.register).mockResolvedValue({
        success: false,
        error: { code: "EMAIL_EXISTS", message: "Email already exists" },
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let registerResult: Awaited<ReturnType<typeof result.current.register>> =
        { success: false };
      await act(async () => {
        registerResult = await result.current.register({
          email: "existing@test.com",
          password: "password123",
          name: "Test User",
        });
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe("Email already exists");
    });
  });

  describe("logout", () => {
    it("should logout and clear user", async () => {
      vi.mocked(apiClient.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          accessToken: "access-token-123",
          expiresIn: 900,
        },
      });
      vi.mocked(apiClient.logout).mockResolvedValue({
        success: true,
        data: { message: "Logged out" },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: "test@test.com",
          password: "password123",
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "algopatterns_access_token"
      );
    });
  });

  describe("loginWithGoogle", () => {
    it("should redirect to Google auth URL", async () => {
      const mockGoogleAuthURL = "https://accounts.google.com/oauth?...";
      const mockState = "random-state-123";

      vi.mocked(apiClient.getGoogleAuthURL).mockResolvedValue({
        success: true,
        data: {
          url: mockGoogleAuthURL,
          state: mockState,
        },
      });

      const originalLocation = window.location;
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loginWithGoogle();
      });

      expect(apiClient.getGoogleAuthURL).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "algopatterns_oauth_state",
        mockState
      );
      expect(mockLocation.href).toBe(mockGoogleAuthURL);

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("should handle Google auth URL failure", async () => {
      vi.mocked(apiClient.getGoogleAuthURL).mockRejectedValue(
        new Error("Network error")
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loginWithGoogle();
      });

      expect(consoleSpy).toHaveBeenCalledWith("Failed to get Google auth URL");
      consoleSpy.mockRestore();
    });
  });

  describe("handleGoogleCallback", () => {
    it("should handle Google callback successfully", async () => {
      const mockCode = "auth-code-123";
      const mockState = "state-123";

      mockLocalStorage.getItem.mockReturnValue(mockState);

      vi.mocked(apiClient.googleCallback).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          accessToken: "access-token-123",
          expiresIn: 900,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let callbackResult: Awaited<
        ReturnType<typeof result.current.handleGoogleCallback>
      > = { success: false };
      await act(async () => {
        callbackResult = await result.current.handleGoogleCallback(
          mockCode,
          mockState
        );
      });

      expect(callbackResult.success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "algopatterns_oauth_state"
      );
    });

    it("should reject invalid OAuth state", async () => {
      const mockCode = "auth-code-123";
      const mockState = "state-123";
      const differentState = "different-state";

      mockLocalStorage.getItem.mockReturnValue(differentState);

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let callbackResult: Awaited<
        ReturnType<typeof result.current.handleGoogleCallback>
      > = { success: false };
      await act(async () => {
        callbackResult = await result.current.handleGoogleCallback(
          mockCode,
          mockState
        );
      });

      expect(callbackResult.success).toBe(false);
      expect(callbackResult.error).toBe(
        "Invalid OAuth state. Please try again."
      );
      expect(apiClient.googleCallback).not.toHaveBeenCalled();
    });

    it("should handle Google callback API failure", async () => {
      const mockCode = "auth-code-123";
      const mockState = "state-123";

      mockLocalStorage.getItem.mockReturnValue(mockState);

      vi.mocked(apiClient.googleCallback).mockResolvedValue({
        success: false,
        error: {
          code: "GOOGLE_TOKEN_EXCHANGE_FAILED",
          message: "Failed to exchange token",
        },
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let callbackResult: Awaited<
        ReturnType<typeof result.current.handleGoogleCallback>
      > = { success: false };
      await act(async () => {
        callbackResult = await result.current.handleGoogleCallback(
          mockCode,
          mockState
        );
      });

      expect(callbackResult.success).toBe(false);
      expect(callbackResult.error).toBe("Failed to exchange token");
      expect(result.current.user).toBeNull();
    });

    it("should handle Google callback network error", async () => {
      const mockCode = "auth-code-123";
      const mockState = "state-123";

      mockLocalStorage.getItem.mockReturnValue(mockState);

      vi.mocked(apiClient.googleCallback).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let callbackResult: Awaited<
        ReturnType<typeof result.current.handleGoogleCallback>
      > = { success: false };
      await act(async () => {
        callbackResult = await result.current.handleGoogleCallback(
          mockCode,
          mockState
        );
      });

      expect(callbackResult.success).toBe(false);
      expect(callbackResult.error).toBe(
        "An error occurred during Google login"
      );
    });
  });
});

describe("useAuth hook", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });
});
