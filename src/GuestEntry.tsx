import { useEffect, useRef, useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Link } from "@/routing/Link";
import { ROUTES, navigate } from "@/routing/router";
import { useAuthStore } from "@/store/authStore";

/**
 * The "Try for Free" address (/try). Starts an anonymous Supabase session, then opens the chat app.
 * Someone who is already signed in (or already a guest) goes straight to the chat app.
 */
export default function GuestEntry() {
  const status = useAuthStatus();
  const [problem, setProblem] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
      navigate(ROUTES.app, { replace: true });
      return;
    }
    if (status === "unauthenticated" && !started.current) {
      started.current = true;
      void useAuthStore
        .getState()
        .signInAsGuest()
        .then((error) => {
          if (error) setProblem(error);
        });
    }
  }, [status]);

  if (!problem) return <div style={{ minHeight: "100dvh", background: "#efebec" }} />;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center text-sm text-foreground"
      role="alert"
    >
      <p>We couldn't start a guest session: {problem}</p>
      <p>
        <Link to={ROUTES.signUp} className="font-medium underline underline-offset-2">
          Create an account
        </Link>{" "}
        or{" "}
        <Link to={ROUTES.landing} className="font-medium underline underline-offset-2">
          go back
        </Link>
        .
      </p>
    </div>
  );
}