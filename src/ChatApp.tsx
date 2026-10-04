import { useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ROUTES, navigate } from "@/routing/router";

/**
 * The chat app, served at /app to signed-in people only.
 * Anyone signed out (or who signs out here) is sent to the landing page.
 */
export default function ChatApp() {
  const status = useAuthStatus();

  useEffect(() => {
    if (status === "unauthenticated") navigate(ROUTES.landing, { replace: true });
  }, [status]);

  if (status !== "authenticated") return null;

  return <ChatLayout />;
}
