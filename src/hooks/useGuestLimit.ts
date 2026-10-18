import { useAuthStore, selectIsGuest } from "@/store/authStore";

/** Non-hook version, for code that runs outside a render. */
export function isGuestLimitReached() {
  const s = useAuthStore.getState();
  return selectIsGuest(s) && s.guestLimitReached;
}

/** The backend enforces the guest quota; this only reflects its "limit reached" answer. */
export function useGuestLimit() {
  const isGuest = useAuthStore(selectIsGuest);
  const reached = useAuthStore((s) => s.guestLimitReached);
  const limitReached = isGuest && reached;
  return { isGuest, limitReached, blocked: limitReached };
}