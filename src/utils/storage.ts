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

// Conversations are saved after every change, and the whole history is serialised each time.
// Writes are coalesced into one per idle period instead of blocking the change that caused them,
// and flushed when the page is hidden or closed so nothing is lost.
let pendingConversations: { value: unknown } | null = null;

function writeConversations() {
  if (!pendingConversations) return;
  const { value } = pendingConversations;
  pendingConversations = null;
  try {
    localStorage.setItem(KEYS.conversations, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, in-memory state still works
  }
}

const scheduleWrite =
  typeof window.requestIdleCallback === "function"
    ? (write: () => void) => window.requestIdleCallback(write, { timeout: 1000 })
    : (write: () => void) => window.setTimeout(write, 200);

window.addEventListener("pagehide", writeConversations);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") writeConversations();
});

export const storage = {
  loadConversations<T>(fallback: T): T {
    return safeParse(localStorage.getItem(KEYS.conversations), fallback);
  },
  saveConversations(value: unknown) {
    if (!pendingConversations) scheduleWrite(writeConversations);
    pendingConversations = { value };
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
