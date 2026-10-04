import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { AuthSession, AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";

  signInWithGoogle: () => Promise<void>;
  /** Resolves to an error message, or null when the sign-in worked. */
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  /** `needsConfirmation` is true when Supabase has emailed a confirmation link instead of signing in. */
  signUpWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  init: () => () => void;
  getAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  status: "loading",

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

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, status: "unauthenticated" });
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