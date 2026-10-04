import { lazy, Suspense, useEffect } from "react";
import { hasStoredSession } from "@/lib/storedSession";
import { ROUTES, routeAuthReturn, takeScrollToTop, usePathname } from "@/routing/router";

// Each address is its own chunk: a landing visitor never downloads the chat app or starts the
// Supabase client, and the chat app never loads the landing's styles or fonts.
const ChatApp = lazy(() => import("@/ChatApp"));
const HomeGate = lazy(() => import("@/HomeGate"));
const LandingPage = lazy(() =>
  import("@/landing/LandingPage").then((module) => ({ default: module.LandingPage }))
);
const PricingPage = lazy(() =>
  import("@/landing/PricingPage").then((module) => ({ default: module.PricingPage }))
);
const AuthPage = lazy(() =>
  import("@/landing/AuthPage").then((module) => ({ default: module.AuthPage }))
);

// The landing pages paint their own paper background, so their placeholder does too.
const paper = <div style={{ minHeight: "100dvh", background: "#efebec" }} />;

// Must run before the first render, so a sign-in return is shown on the right page from the start.
routeAuthReturn();

export default function App() {
  const path = usePathname();

  useEffect(() => {
    if (takeScrollToTop() && !window.location.hash) window.scrollTo(0, 0);
  }, [path]);

  if (path === ROUTES.app) {
    return (
      <Suspense fallback={null}>
        <ChatApp />
      </Suspense>
    );
  }

  if (path === ROUTES.pricing) {
    return (
      <Suspense fallback={paper}>
        <PricingPage />
      </Suspense>
    );
  }

  if (path === ROUTES.signIn || path === ROUTES.signUp) {
    return (
      <Suspense fallback={paper}>
        <AuthPage mode={path === ROUTES.signUp ? "signup" : "signin"} />
      </Suspense>
    );
  }

  // The site root: the chat app for someone signed in, the landing page for everyone else.
  // Only a browser with a saved session pays for the check; other visitors get the landing at once.
  if (hasStoredSession()) {
    return (
      <Suspense fallback={null}>
        <HomeGate>
          <Suspense fallback={paper}>
            <LandingPage />
          </Suspense>
        </HomeGate>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={paper}>
      <LandingPage />
    </Suspense>
  );
}
