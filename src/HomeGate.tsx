import { useEffect, type ReactNode } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ROUTES, navigate } from "@/routing/router";

/**
 * Decides what the site root shows for a browser that has a saved session:
 * signed-in people go straight to the chat app, and a session that turns out to be expired
 * falls back to the landing page passed in as children.
 */
export default function HomeGate({ children }: { children: ReactNode }) {
  const status = useAuthStatus();

  useEffect(() => {
    if (status === "authenticated") navigate(ROUTES.app, { replace: true });
  }, [status]);

  if (status === "unauthenticated") return <>{children}</>;

  return null;
}
