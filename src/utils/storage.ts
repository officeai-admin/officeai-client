/**
 * Single point of contact with localStorage.
 * Nothing else in the app should call window.localStorage directly.
 */

const KEYS = {
  conversations: "ai-assistant:conversations",
  activeId: "ai-assistant:active-id",
  theme: "ai-assistant:theme",
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  loadConversations<T>(fallback: T): T {
    return safeParse(localStorage.getItem(KEYS.conversations), fallback);
  },
  saveConversations(value: unknown) {
    try {
      localStorage.setItem(KEYS.conversations, JSON.stringify(value));
    } catch {
      // storage full or unavailable — fail silently, in-memory state still works
    }
  },
  loadActiveId(): string | null {
    return localStorage.getItem(KEYS.activeId);
  },
  saveActiveId(id: string | null) {
    if (id) localStorage.setItem(KEYS.activeId, id);
    else localStorage.removeItem(KEYS.activeId);
  },
  loadTheme(): "light" | "dark" | "system" | null {
    return localStorage.getItem(KEYS.theme) as "light" | "dark" | "system" | null;
  },
  saveTheme(theme: "light" | "dark" | "system") {
    localStorage.setItem(KEYS.theme, theme);
  },
};
