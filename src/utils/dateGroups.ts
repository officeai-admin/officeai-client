import type { Conversation } from "@/types/chat";

export type DateGroupLabel = "Today" | "Yesterday" | "Previous 7 days" | "Older";

export function groupConversationsByDate(
  list: Conversation[]
): Record<DateGroupLabel, Conversation[]> {
  const now = Date.now();
  const day = 86_400_000;
  const groups: Record<DateGroupLabel, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };

  for (const c of list) {
    const diff = now - c.updatedAt;
    const sameCalendarDay =
      new Date(c.updatedAt).toDateString() === new Date(now).toDateString();

    if (sameCalendarDay) groups.Today.push(c);
    else if (diff < 2 * day) groups.Yesterday.push(c);
    else if (diff < 8 * day) groups["Previous 7 days"].push(c);
    else groups.Older.push(c);
  }

  return groups;
}
