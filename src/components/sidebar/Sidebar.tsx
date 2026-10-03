import { useState } from "react";
import { Plus, PanelLeftClose, Sparkles, X } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { SearchConversations } from "./SearchConversations";
import { ConversationList } from "./ConversationList";
import { SidebarFooter } from "./SidebarFooter";
import { cn } from "@/utils/helpers";

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const [search, setSearch] = useState("");
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const newConversation = useChatStore((s) => s.newConversation);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const content = (
    <div className="flex h-full w-[268px] flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-3 pb-2 pt-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-accent">
            <Sparkles size={15} className="text-accent-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">AI Assistant</span>
        </div>
        <button
          aria-label="Collapse sidebar"
          onClick={onToggleCollapse}
          className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted md:block"
        >
          <PanelLeftClose size={17} />
        </button>
        <button
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
        >
          <X size={17} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={newConversation}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus size={16} /> New chat
        </button>
      </div>

      <SearchConversations value={search} onChange={setSearch} />
      <ConversationList
        conversations={filtered}
        activeId={activeId}
        onSelect={(id) => {
          selectConversation(id);
          onCloseMobile();
        }}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />
      <SidebarFooter />
    </div>
  );

  if (collapsed) return null;

  return (
    <>
      <div className="hidden md:block">{content}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
