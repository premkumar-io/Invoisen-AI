import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Safely get search params. This is from the official tanstack router docs.
  // https://tanstack.com/router/latest/docs/framework/react/guide/search-params
  const { accessToken } = Route.useSearch() as { accessToken?: string };

  useEffect(() => {
    async function handleAuth() {
      if (!accessToken) {
        setError("No access token found. Please try again.");
        return;
      }

      try {
        await handleGoogleCallback(accessToken);
        await navigate({ to: "/dashboard" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    }

    handleAuth();
  }, [accessToken, handleGoogleCallback, navigate]);

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
      </div>
      <div className="mx-auto mt-20 flex max-w-md flex-col items-center justify-center text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold">Authentication Failed</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button asChild className="mt-6">
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
            <h1 className="mt-4 text-2xl font-bold">Authenticating...</h1>
            <p className="text-muted-foreground">Please wait while we securely log you in.</p>
          </>
        )}
      </div>
    </main>
  );
}
