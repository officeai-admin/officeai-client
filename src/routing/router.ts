import { useSyncExternalStore } from "react";

/**
 * The app has a handful of addresses, so this is a path switch rather than a routing library:
 * the landing page, pricing and contact, sign in / sign up, and the chat app.
 */
export const ROUTES = {
  landing: "/",
  pricing: "/pricing",
  signIn: "/signin",
  signUp: "/signup",
  app: "/app",
} as const;

const listeners = new Set<() => void>();
let scrollToTopPending = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function readPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "" ? ROUTES.landing : path;
}

/** The current path, without a trailing slash. Re-renders on navigate() and on back/forward. */
export function usePathname() {
  return useSyncExternalStore(subscribe, readPath);
}

/**
 * Go to another address inside the app without reloading the page.
 * `replace` swaps the current history entry instead of adding one, for redirects.
 */
export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href);
  const address = url.pathname + url.search + url.hash;
  if (replace) window.history.replaceState(null, "", address);
  else window.history.pushState(null, "", address);
  scrollToTopPending = true;
  listeners.forEach((listener) => listener());
}

/**
 * True once after navigate(): a page reached by a link starts at the top, while back/forward
 * keeps the scroll position the browser restores.
 */
export function takeScrollToTop() {
  const pending = scrollToTopPending;
  scrollToTopPending = false;
  return pending;
}

/**
 * Google sign-in and email confirmation return to the site root (authStore redirects to
 * window.location.origin, the only URL allowed in Supabase) with the outcome in the address.
 * A session goes to the chat app; an error goes to the sign-in page, which shows it. The hash and
 * query are kept intact for the Supabase client and the sign-in page to read.
 */
export function routeAuthReturn() {
  const path = readPath();
  if (path === ROUTES.app || path === ROUTES.signIn || path === ROUTES.signUp) return;

  const { hash, search } = window.location;
  const hasError =
    /(?:^#|&)(?:error|error_code|error_description)=/.test(hash) ||
    /(?:^\?|&)(?:error|error_code|error_description)=/.test(search);
  const hasSession = /(?:^#|&)access_token=/.test(hash) || /(?:^\?|&)code=/.test(search);
  if (!hasError && !hasSession) return;

  window.history.replaceState(null, "", (hasError ? ROUTES.signIn : ROUTES.app) + search + hash);
}
