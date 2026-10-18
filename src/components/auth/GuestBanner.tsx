import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "@/routing/Link";
import { ROUTES } from "@/routing/router";
import { useGuestLimit } from "@/hooks/useGuestLimit";

/**
 * Shown to guests once the backend says the free quota is used up.
 * First as a centered dialog; if the guest closes it, a slim reminder bar stays above the input.
 */
export function GuestBanner() {
  const { limitReached } = useGuestLimit();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!limitReached || dismissed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [limitReached, dismissed]);

  if (!limitReached) return null;

  if (dismissed) {
    return (
      <div className="mx-auto w-full max-w-[780px] px-4">
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-lg border border-accent bg-card px-3 py-2 text-xs text-foreground"
        >
          <span>You've reached the free guest limit. Sign in to keep chatting.</span>
          <Link to={ROUTES.signIn} className="font-medium underline underline-offset-2">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setDismissed(true)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-limit-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-xl"
      >
        <button
          aria-label="Close"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X size={18} />
        </button>

        <h2 id="guest-limit-title" className="text-lg font-semibold text-foreground">
          You've reached the free limit
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or create a free account to keep chatting, upload documents and save your chat history.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            to={ROUTES.signIn}
            className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            to={ROUTES.signUp}
            className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}