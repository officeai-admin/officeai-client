import type { Conversation } from "@/types/chat";
import { groupConversationsByDate } from "@/utils/dateGroups";
import { ConversationItem } from "./ConversationItem";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchX } from "lucide-react";

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return <EmptyState icon={SearchX} title="No conversations found." />;
  }

  const groups = groupConversationsByDate(conversations);

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {Object.entries(groups).map(([label, items]) =>
        items.length === 0 ? null : (
          <div key={label} className="mb-2.5">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            {items.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onSelect={() => onSelect(c.id)}
                onRename={(title) => onRename(c.id, title)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
