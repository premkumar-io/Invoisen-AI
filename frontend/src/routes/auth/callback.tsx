import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

type AuthCallbackSearch = {
  accessToken?: string;
  token?: string;
  code?: string;
  error?: string;
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => {
    return {
      accessToken: typeof search.accessToken === "string" ? search.accessToken : undefined,
      token: typeof search.token === "string" ? search.token : undefined,
      code: typeof search.code === "string" ? search.code : undefined,
      error: typeof search.error === "string" ? search.error : undefined,
    };
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const searchParams = Route.useSearch();

  useEffect(() => {
    async function handleAuth() {
      let tokenToUse = searchParams.accessToken || searchParams.token;

      if (!tokenToUse && typeof window !== "undefined") {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          tokenToUse = urlParams.get("accessToken") || urlParams.get("token") || urlParams.get("code") || undefined;

          if (!tokenToUse && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            tokenToUse = hashParams.get("accessToken") || hashParams.get("token") || hashParams.get("access_token") || undefined;
          }
        } catch (e) {
          // ignore fallback parsing error
        }
      }

      if (searchParams.error) {
        setError(searchParams.error);
        return;
      }

      if (!tokenToUse) {
        setError("No access token found. Please try logging in again.");
        return;
      }

      try {
        await handleGoogleCallback(tokenToUse);
        await navigate({ to: "/welcome", replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google authentication failed. Please try again.");
      }
    }

    handleAuth();
  }, [searchParams.accessToken, searchParams.token, searchParams.error, handleGoogleCallback, navigate]);

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
      </div>
      <div className="mx-auto mt-20 flex max-w-md flex-col items-center justify-center text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-foreground">Authentication Failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button asChild className="mt-6 rounded-full font-bold">
              <a href="/login">Go to Login</a>
            </Button>
          </>
        ) : (
          <>
            <div
              className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Authenticating...</h1>
            <p className="text-sm text-muted-foreground">Please wait while we securely set up your session.</p>
          </>
        )}
      </div>
    </main>
  );
}
