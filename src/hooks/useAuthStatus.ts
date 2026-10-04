import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Starts the auth store (once per mounted consumer) and returns whether someone is signed in:
 * "loading" until Supabase has answered, then "authenticated" or "unauthenticated".
 */
export function useAuthStatus() {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    const unsubscribe = useAuthStore.getState().init();
    return unsubscribe;
  }, []);

  return status;
}
