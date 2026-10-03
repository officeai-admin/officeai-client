import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "@/components/input/ChatInput";
import { ToastStack } from "@/components/common/Toast";
import { useChatStore } from "@/store/chatStore";
import type { Conversation, Message } from "@/types/chat";
import { generateTitle } from "@/services/titleService";

function ChatConversationPane({
  conversation,
  conversationId,
}: {
  conversation: Conversation | null;
  conversationId: string | null;
}) {
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const replaceMessagesFrom = useChatStore((state) => state.replaceMessagesFrom);
  const setConversationTitle = useChatStore((state) => state.setConversationTitle);
  const setFeedback = useChatStore((state) => state.setFeedback);

  // No backend wired up — sending just adds the message to the
  // conversation locally. No request goes out and no reply comes back.
  const handleSend = (text: string, attachments: Message["attachments"]) => {
    const { conversationId: id, isFirstMessage } = addUserMessage(text, attachments);

    if (isFirstMessage && text) {
      void generateTitle(text).then((result) => {
        if (!result) return;
        setConversationTitle(id, `${result.emoji} ${result.title}`);
      });
    }
  };

  const handleEdit = (messageId: string, newContent: string) => {
    if (!conversationId) return;
    replaceMessagesFrom(conversationId, messageId, newContent);
  };

  // Nothing to regenerate without a backend producing replies.
  const handleRegenerate = () => {};

  const handleFeedback = (messageId: string, kind: "up" | "down") => {
    setFeedback(messageId, kind);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ChatMessages
        conversation={conversation}
        onSend={handleSend}
        onEditMessage={handleEdit}
        onRegenerate={handleRegenerate}
        onFeedback={handleFeedback}
      />
      <ChatInput onSend={handleSend} disabled={false} />
    </div>
  );
}

export function ChatLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const activeId = useChatStore((state) => state.activeId);

  const active = conversations.find((conversation) => conversation.id === activeId) ?? null;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          conversation={active}
          collapsed={collapsed}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onExpandSidebar={() => setCollapsed(false)}
        />

        <ChatConversationPane conversation={active} conversationId={activeId} />

        <ToastStack />
      </div>
    </div>
  );
}
