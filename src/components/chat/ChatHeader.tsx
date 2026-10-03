import { useEffect, useState } from "react";
import { ChevronDown, Menu, MoreHorizontal, PanelLeftOpen, Share2 } from "lucide-react";
import type { Conversation } from "@/types/chat";
import { MODELS } from "@/types/chat";
import { useChatStore } from "@/store/chatStore";
import { ConversationSummaryPanel } from "./ConversationSummary";

export function ChatHeader({
  conversation,
  collapsed,
  onOpenMobileSidebar,
  onExpandSidebar,
}: {
  conversation: Conversation | null;
  collapsed: boolean;
  onOpenMobileSidebar: () => void;
  onExpandSidebar: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(conversation?.title ?? "");
  const [modelOpen, setModelOpen] = useState(false);

  const renameConversation = useChatStore((s) => s.renameConversation);
  const setModel = useChatStore((s) => s.setModel);
  const pushToast = useChatStore((s) => s.pushToast);

  useEffect(() => setValue(conversation?.title ?? ""), [conversation?.id]);

  const commit = () => {
    if (conversation && value.trim()) renameConversation(conversation.id, value.trim());
    setEditing(false);
  };

  return (
    <div className="flex min-h-[52px] items-center justify-between border-b border-border px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          aria-label="Open menu"
          onClick={onOpenMobileSidebar}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
        >
          <Menu size={18} />
        </button>
        {collapsed && (
          <button
            aria-label="Open sidebar"
            onClick={onExpandSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="rounded-md border border-border bg-muted px-2 py-0.5 text-[14.5px] font-semibold text-foreground"
          />
        ) : (
          <span
            onClick={() => conversation && setEditing(true)}
            className="truncate text-[14.5px] font-semibold text-foreground"
          >
            {conversation ? conversation.title : "New chat"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <ConversationSummaryPanel messages={conversation?.messages ?? []} />
        <div className="relative">
          <button
            onClick={() => setModelOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"
          >
            {conversation?.model ?? MODELS[0]} <ChevronDown size={13} />
          </button>
          {modelOpen && (
            <div className="absolute right-0 top-9 z-40 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (conversation) setModel(conversation.id, m);
                    setModelOpen(false);
                  }}
                  className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          aria-label="Share conversation"
          onClick={() => pushToast("Link copied")}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <Share2 size={16} />
        </button>
        <button aria-label="More options" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
