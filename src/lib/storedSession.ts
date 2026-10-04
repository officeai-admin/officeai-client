/**
 * A cheap, synchronous look for a saved Supabase session, without loading the Supabase client.
 * supabase-js keeps the session in localStorage under "sb-<project ref>-auth-token".
 *
 * This is only a hint. A stored session can be expired, so anything that depends on being signed
 * in still asks the auth store; the hint just lets a visitor who has never signed in see the
 * landing page straight away, without downloading or starting the client.
 */
export function hasStoredSession() {
  try {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (key && /^sb-.+-auth-token$/.test(key)) return true;
    }
  } catch {
    // storage unavailable (private mode, blocked): treat as signed out
  }
  return false;
}
