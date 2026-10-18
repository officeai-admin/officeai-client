import { useEffect, type ReactNode } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ROUTES, navigate } from "@/routing/router";
import { selectIsGuest, useAuthStore } from "@/store/authStore";

/**
 * Decides what the site root shows for a browser that has a saved session:
 * signed-in people go straight to the chat app, and a session that turns out to be expired
 * falls back to the landing page passed in as children. A guest (anonymous session) is not
 * signed in, so they can browse the landing page like anyone else.
 */
export default function HomeGate({ children }: { children: ReactNode }) {
  const status = useAuthStatus();
  const isGuest = useAuthStore(selectIsGuest);

  useEffect(() => {
    if (status === "authenticated" && !isGuest) navigate(ROUTES.app, { replace: true });
  }, [status, isGuest]);

  if (status === "unauthenticated" || isGuest) return <>{children}</>;

  return null;
}