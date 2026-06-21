"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Google login was cancelled or failed. Please try again.");
        return;
      }

      if (!code || !state) {
        setError("Invalid callback. Missing required parameters.");
        return;
      }

      const result = await handleGoogleCallback(code, state);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to complete Google login.");
      }
    };

    if (!isAuthenticated) {
      processCallback();
    } else {
      router.push("/");
    }
  }, [searchParams, handleGoogleCallback, router, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-700 dark:border-gray-700 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white dark:text-white mb-2">
              Login Failed
            </h1>
            <p className="text-gray-400 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-700 dark:border-gray-700 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white dark:text-white mb-2">
            Completing Sign In
          </h1>
          <p className="text-gray-400 dark:text-gray-400">
            Please wait while we complete your Google sign in...
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-700 dark:border-gray-700 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white dark:text-white mb-2">
            Loading
          </h1>
          <p className="text-gray-400 dark:text-gray-400">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
