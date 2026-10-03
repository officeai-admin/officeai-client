import { create } from "zustand";
import type { Conversation, Message, ModelName } from "@/types/chat";
import { uid } from "@/utils/helpers";
import { seedConversations } from "@/data/mockData";
import { storage } from "@/utils/storage";

interface ToastItem {
  id: string;
  message: string;
}

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  toasts: ToastItem[];

  newConversation: () => string;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  setModel: (id: string, model: ModelName | string) => void;

  addUserMessage: (
    text: string,
    attachments: Message["attachments"]
  ) => {
    conversationId: string;
    userMessageId: string;
    isFirstMessage: boolean;
  };
  replaceMessagesFrom: (conversationId: string, messageId: string, newContent: string) => void;

  addAssistantPlaceholder: (conversationId: string) => string;
  completeAssistantMessage: (conversationId: string, messageId: string, content: string) => void;
  failAssistantMessage: (conversationId: string, messageId: string, error: string) => void;
  resetMessageToStreaming: (conversationId: string, messageId: string) => void;

  setConversationTitle: (id: string, title: string) => void;
  setFeedback: (messageId: string, kind: "up" | "down") => void;

  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

function updateConversation(
  conversations: Conversation[],
  id: string,
  updater: (c: Conversation) => Conversation
) {
  return conversations.map((c) =>
    c.id === id ? { ...updater(c), updatedAt: Date.now() } : c
  );
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: storage.loadConversations(seedConversations()),
  activeId: storage.loadActiveId(),
  toasts: [],

  newConversation: () => {
    const now = Date.now();
    const c: Conversation = {
      id: uid(),
      title: "New chat",
      createdAt: now,
      updatedAt: now,
      model: "GPT-Style Assistant",
      messages: [],
    };

    set((s) => ({
      conversations: [c, ...s.conversations],
      activeId: c.id,
    }));

    storage.saveActiveId(c.id);
    storage.saveConversations(get().conversations);
    return c.id;
  },

  selectConversation: (id) => {
    set({ activeId: id });
    storage.saveActiveId(id);
  },

  renameConversation: (id, title) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, id, (c) => ({
        ...c,
        title,
      })),
    }));
    get().pushToast("Conversation renamed");
    storage.saveConversations(get().conversations);
  },

  deleteConversation: (id) => {
    set((s) => {
      const conversations = s.conversations.filter((c) => c.id !== id);
      const nextActiveId = s.activeId === id ? conversations[0]?.id ?? null : s.activeId;
      return { conversations, activeId: nextActiveId };
    });

    const nextActiveId = get().activeId;
    if (nextActiveId) {
      storage.saveActiveId(nextActiveId);
    } else {
      storage.saveActiveId(null);
    }

    get().pushToast("Conversation deleted");
    storage.saveConversations(get().conversations);
  },

  setModel: (id, model) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, id, (c) => ({
        ...c,
        model,
      })),
    }));
    storage.saveConversations(get().conversations);
  },

  addUserMessage: (text, attachments) => {
    let conversationId = get().activeId;

    if (!conversationId) {
      conversationId = get().newConversation();
    }

    const conversation = get().conversations.find((c) => c.id === conversationId);
    const isFirstMessage = (conversation?.messages.length ?? 0) === 0;
    const userMessageId = uid();

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: text,
      createdAt: Date.now(),
      status: "complete",
      attachments,
    };

    set((s) => ({
      conversations: updateConversation(s.conversations, conversationId!, (c) => ({
        ...c,
        title: isFirstMessage && text ? text.slice(0, 42) : c.title,
        messages: [...c.messages, userMessage],
      })),
    }));

    storage.saveConversations(get().conversations);

    return {
      conversationId,
      userMessageId,
      isFirstMessage,
    };
  },

  // Used for editing a user message: keeps everything before it, updates its
  // content, and drops everything after it (there's no backend reply to
  // regenerate against, so this is purely a local edit).
  replaceMessagesFrom: (conversationId, messageId, newContent) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, conversationId, (c) => {
        const index = c.messages.findIndex((message) => message.id === messageId);
        if (index === -1) return c;

        const kept = c.messages.slice(0, index);
        const edited: Message = { ...c.messages[index], content: newContent };

        return { ...c, messages: [...kept, edited] };
      }),
    }));
    storage.saveConversations(get().conversations);
  },

  // Adds an empty "streaming" assistant message immediately, so the UI can
  // show a typing indicator while we wait for the backend's real response.
  addAssistantPlaceholder: (conversationId) => {
    const messageId = uid();
    const placeholder: Message = {
      id: messageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      status: "streaming",
    };

    set((s) => ({
      conversations: updateConversation(s.conversations, conversationId, (c) => ({
        ...c,
        messages: [...c.messages, placeholder],
      })),
    }));
    storage.saveConversations(get().conversations);

    return messageId;
  },

  // Fills the placeholder with the real answer once the backend responds.
  completeAssistantMessage: (conversationId, messageId, content) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, conversationId, (c) => ({
        ...c,
        messages: c.messages.map((message) =>
          message.id === messageId ? { ...message, content, status: "complete" } : message
        ),
      })),
    }));
    storage.saveConversations(get().conversations);
  },

  // Marks the placeholder as failed if the backend call throws.
  failAssistantMessage: (conversationId, messageId, error) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, conversationId, (c) => ({
        ...c,
        messages: c.messages.map((message) =>
          message.id === messageId ? { ...message, status: "error", error } : message
        ),
      })),
    }));
    storage.saveConversations(get().conversations);
  },

  resetMessageToStreaming: (conversationId, messageId) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, conversationId, (c) => ({
        ...c,
        messages: c.messages.map((message) =>
          message.id === messageId
            ? { ...message, status: "streaming", content: "", error: undefined }
            : message
        ),
      })),
    }));
    storage.saveConversations(get().conversations);
  },

  setConversationTitle: (id, title) => {
    set((s) => ({
      conversations: updateConversation(s.conversations, id, (c) => ({
        ...c,
        title,
      })),
    }));
    storage.saveConversations(get().conversations);
  },

  setFeedback: (messageId, kind) => {
    const { activeId } = get();
    if (!activeId) return;

    set((s) => ({
      conversations: updateConversation(s.conversations, activeId, (c) => ({
        ...c,
        messages: c.messages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                feedback:
                  message.feedback === kind ? undefined : kind,
              }
            : message
        ),
      })),
    }));

    storage.saveConversations(get().conversations);
    get().pushToast(kind === "up" ? "Thanks for the feedback" : "Thanks, noted");
  },

  pushToast: (message) => {
    const id = uid();
    set((s) => ({
      toasts: [...s.toasts, { id, message }],
    }));
    setTimeout(() => get().dismissToast(id), 1800);
  },

  dismissToast: (id) => {
    set((s) => ({
      toasts: s.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));