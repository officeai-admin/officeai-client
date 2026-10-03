import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { AuthSession, AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";

  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  init: () => () => void;
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

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, status: "unauthenticated" });
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