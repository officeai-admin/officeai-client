import React, { useCallback } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "@/components/input/ChatInput";
import { ToastStack } from "@/components/common/Toast";
import { useChatStore } from "@/store/chatStore";
import type { Conversation, Message } from "@/types/chat";
import { generateTitle } from "@/services/titleService";
import { sendChatMessage } from "@/services/chatApiService";
import { GuestBanner } from "@/components/auth/GuestBanner";
import { useGuestLimit } from "@/hooks/useGuestLimit";

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

  const isConversationPending = useChatStore(
    (state) => !!conversationId && state.pendingConversationIds.includes(conversationId)
  );

  const { blocked: guestBlocked } = useGuestLimit();

  const handleSend = async (text: string, attachments: Message["attachments"]) => {
    if (isConversationPending || guestBlocked) return;
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

    // The chat may have just been created, so wait for its backend conversation_id (guests have none).
    const target = await useChatStore.getState().resolveConversation(id);
    if (!target.ok) {
      failAssistantMessage(id, placeholderId, "Couldn't start this chat on the server. Please try again.");
      return;
    }

    try {
      const response = await sendChatMessage(text, id, target.conversationId);
      completeAssistantMessage(id, placeholderId, response.answer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      failAssistantMessage(id, placeholderId, message);
    }
  };

  // Stable callbacks, so the memoised messages don't all re-render on every store update.
  const handleEdit = useCallback(
    (messageId: string, newContent: string) => {
      if (!conversationId) return;
      replaceMessagesFrom(conversationId, messageId, newContent);
    },
    [conversationId, replaceMessagesFrom]
  );

  const handleRegenerate = useCallback(async (messageId: string) => {
    if (guestBlocked) return;
    const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId);
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
      const response = await sendChatMessage(userMessage.content, conversationId, conversation.conversationId);
      completeAssistantMessage(conversationId, messageId, response.answer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      failAssistantMessage(conversationId, messageId, message);
    }
  }, [conversationId, guestBlocked, resetMessageToStreaming, completeAssistantMessage, failAssistantMessage]);

  const handleFeedback = useCallback(
    (messageId: string, kind: "up" | "down") => {
      setFeedback(messageId, kind);
    },
    [setFeedback]
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ChatMessages
        key={conversationId ?? "new"}
        conversation={conversation}
        onSend={handleSend}
        onEditMessage={handleEdit}
        onRegenerate={handleRegenerate}
        onFeedback={handleFeedback}
      />
      <GuestBanner />
      <ChatInput onSend={handleSend} disabled={false} sendBlocked={isConversationPending || guestBlocked} />
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