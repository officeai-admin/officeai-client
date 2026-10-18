import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { AuthSession, AuthUser } from "@/types/auth";
import { storage } from "@/utils/storage";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";

  /** Set when the backend says this guest used up its free quota (HTTP 429). */
  guestLimitReached: boolean;
  markGuestLimitReached: () => void;

  signInWithGoogle: () => Promise<void>;
  /** Resolves to an error message, or null when the sign-in worked. */
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  /** `needsConfirmation` is true when Supabase has emailed a confirmation link instead of signing in. */
  signUpWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  /** Starts an anonymous (guest) session. Resolves to an error message, or null when it worked. */
  signInAsGuest: () => Promise<string | null>;
  signOut: () => Promise<void>;
  init: () => () => void;
  getAccessToken: () => Promise<string | null>;
}

/** True for an anonymous Supabase user (the "Try for Free" session). */
export const selectIsGuest = (state: { user: AuthUser | null }) => state.user?.is_anonymous === true;

/** Guests are never written to localStorage, so the storage layer has to know who is signed in. */
function syncStorageMode(session: AuthSession | null) {
  storage.setEphemeral(session?.user?.is_anonymous === true);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  status: "loading",
  guestLimitReached: false,
  markGuestLimitReached: () => set({ guestLimitReached: true }),

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    // The browser redirects to Google's login page here.
    // Nothing after this line runs until the user comes back.
  },

  // Email and password. On success the onAuthStateChange listener in init() updates the state.
  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  },

  signUpWithPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    return { error: null, needsConfirmation: !data.session };
  },

  // Anonymous sign-in: a real Supabase session (and access token) without an email. The auth state listener in init() picks it up.
  signInAsGuest: async () => {
    const { error } = await supabase.auth.signInAnonymously();
    return error ? error.message : null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, status: "unauthenticated", guestLimitReached: false });
  },

  getAccessToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },

  // Called once when the app first loads.
  init: () => {
    // Check if a session already exists (e.g. you refreshed the page after logging in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      syncStorageMode(session);
      set({
        session,
        user: session?.user ?? null,
        status: session ? "authenticated" : "unauthenticated",
      });
    });

    // Listen for future changes: login, logout, token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      syncStorageMode(session);
      set({
        session,
        user: session?.user ?? null,
        status: session ? "authenticated" : "unauthenticated",
      });
    });
    // Return a cleanup function so callers can unsubscribe.
    return () => subscription.unsubscribe();
  },
}));