import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "@/components/input/ChatInput";
import { ToastStack } from "@/components/common/Toast";
import { useChatStore } from "@/store/chatStore";
import type { Conversation, Message } from "@/types/chat";
import { generateTitle } from "@/services/titleService";
import { sendChatMessage } from "@/services/chatApiService";

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
  const addAssistantPlaceholder = useChatStore((state) => state.addAssistantPlaceholder);
  const completeAssistantMessage = useChatStore((state) => state.completeAssistantMessage);
  const failAssistantMessage = useChatStore((state) => state.failAssistantMessage);
  const resetMessageToStreaming = useChatStore((state) => state.resetMessageToStreaming);

  const handleSend = async (text: string, attachments: Message["attachments"]) => {
    const { conversationId: id, isFirstMessage } = addUserMessage(text, attachments);

    if (isFirstMessage && text) {
      void generateTitle(text).then((result) => {
        if (!result) return;
        setConversationTitle(id, `${result.emoji} ${result.title}`);
      });
    }

    // Show a "typing" placeholder immediately, then fill it in once the
    // backend replies (or mark it failed if the call throws).
    const placeholderId = addAssistantPlaceholder(id);

    try {
      const response = await sendChatMessage(text, id);
      completeAssistantMessage(id, placeholderId, response.answer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      failAssistantMessage(id, placeholderId, message);
    }
  };

  const handleEdit = (messageId: string, newContent: string) => {
    if (!conversationId) return;
    replaceMessagesFrom(conversationId, messageId, newContent);
  };

  const handleRegenerate = async (messageId: string) => {
    if (!conversationId || !conversation) return;

    const index = conversation.messages.findIndex((m) => m.id === messageId);
    if (index === -1) return;

    // Walk backwards from this assistant message to find the user question
    // that prompted it.
    const userMessage = [...conversation.messages.slice(0, index)]
      .reverse()
      .find((m) => m.role === "user");
    if (!userMessage) return;
    resetMessageToStreaming(conversationId, messageId);
    try {
      const response = await sendChatMessage(userMessage.content, conversationId);
      completeAssistantMessage(conversationId, messageId, response.answer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      failAssistantMessage(conversationId, messageId, message);
    }
  };

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