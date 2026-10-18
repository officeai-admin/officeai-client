import { create } from "zustand";
import type { Conversation, Message, ModelName } from "@/types/chat";
import { uid } from "@/utils/helpers";
import { storage } from "@/utils/storage";
import { selectIsGuest, useAuthStore } from "@/store/authStore";
import { createConversation, listConversations, deleteConversation as deleteConversationApi, listConversationMessages } from "@/services/chatApiService";

interface ToastItem {
  id: string;
  message: string;
}

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  toasts: ToastItem[];
  pendingConversationIds: string[];

  newConversation: () => string;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  setModel: (id: string, model: ModelName | string) => void;
  loadConversationsFromServer: () => Promise<void>;
  loadMessagesForConversation: (id: string) => Promise<void>;
  waitForConversationId: (id: string) => Promise<string | null>;
  /**
 * What a send or upload needs to know about the server side of a chat.
 * Signed-in users: wait for the chat to be registered and return its backend id (ok is false if that failed).
 * Guests are treated the same way.
 */
  resolveConversation: (
    id: string
  ) => Promise<{ ok: boolean; conversationId: string | null }>;
  /** Empties the in-memory chat state for a guest, so cached or sample chats never show. */
  startGuestSession: () => void;

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

const registrations = new Map<string, Promise<void>>();

// Conversations showing messages from the local cache that haven't been checked against the server
// yet this session. They're shown straight away and replaced once the server answers.
const staleIds = new Set<string>();
const messageLoads = new Map<string, Promise<void>>();

function sameMessage(a: Message, b: Message) {
  return (
    a.role === b.role &&
    a.content === b.content &&
    a.createdAt === b.createdAt &&
    a.status === b.status &&
    !a.attachments &&
    !a.feedback &&
    !a.error
  );
}

/** Reuses cached message objects (and the whole array) the server didn't change, so React can skip them. */
function reuseUnchanged(previous: Message[], next: Message[]) {
  const byId = new Map(previous.map((message) => [message.id, message]));
  let changed = previous.length !== next.length;
  const merged = next.map((message, index) => {
    const old = byId.get(message.id);
    if (old && sameMessage(old, message)) {
      if (previous[index] !== old) changed = true;
      return old;
    }
    changed = true;
    return message;
  });
  return changed ? merged : previous;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: storage.loadConversations<Conversation[]>([]),
  activeId: storage.loadActiveId(),
  toasts: [],
  pendingConversationIds: [],

  newConversation: () => {
    const now = Date.now();
    const c: Conversation = {
      id: uid(),
      title: "New chat",
      createdAt: now,
      updatedAt: now,
      model: "GPT-Style Assistant",
      messages: [],
      conversationId: null,
    };

    const guest = selectIsGuest(useAuthStore.getState());

    set((s) => ({
      // A guest only ever shows one conversation, so a new chat replaces it in the UI.
      conversations: guest ? [c] : [c, ...s.conversations],
      activeId: c.id,
      pendingConversationIds: [...s.pendingConversationIds, c.id],
    }));

    storage.saveActiveId(c.id);
    storage.saveConversations(get().conversations);

    const registration = createConversation()
      .then((response) => {
        set((s) => ({
          conversations: s.conversations.map((conv) =>
            conv.id === c.id ? { ...conv, conversationId: response.conversation.conversation_id } : conv
          ),
          pendingConversationIds: s.pendingConversationIds.filter((id) => id !== c.id),
        }));
        storage.saveConversations(get().conversations);
      })
      .catch(() => {
        set((s) => {
          const conversations = s.conversations.filter((conv) => conv.id !== c.id);
          return {
            conversations,
            activeId: s.activeId === c.id ? conversations[0]?.id ?? null : s.activeId,
            pendingConversationIds: s.pendingConversationIds.filter((id) => id !== c.id),
          };
        });
        storage.saveActiveId(get().activeId);
        storage.saveConversations(get().conversations);
        get().pushToast("Couldn't start a new chat. Please try again.");
      });
    registrations.set(c.id, registration);
    void registration.finally(() => registrations.delete(c.id));
    return c.id;
  },

  selectConversation: (id) => {
    set({ activeId: id });
    storage.saveActiveId(id);
    void get().loadMessagesForConversation(id);
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
    const conversation = get().conversations.find((c) => c.id === id);

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

    // Mirror the deletion on the backend so it doesn't resurface on next login.
    if (conversation?.conversationId) {
      void deleteConversationApi(conversation.conversationId).catch(() => {
        get().pushToast("Couldn't delete this conversation from the server");
      });
    }
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

  loadConversationsFromServer: async () => {
    try {
      const response = await listConversations();
      // Keep the cached messages on screen while the server copy loads, instead of blanking them.
      const cached = new Map(
        get().conversations.map((c) => [c.conversationId ?? c.id, c.messages] as const)
      );
      staleIds.clear();
      const loaded: Conversation[] = response.conversations.map((c) => {
        const messages = cached.get(c.conversation_id) ?? [];
        if (messages.length > 0) staleIds.add(c.conversation_id);
        return {
          id: c.conversation_id,
          title: c.title,
          createdAt: new Date(c.created_at).getTime(),
          updatedAt: new Date(c.updated_at).getTime(),
          model: "GPT-Style Assistant",
          messages,
          conversationId: c.conversation_id,
        };
      });

      // Guests only ever see one conversation: their most recent one.
      if (selectIsGuest(useAuthStore.getState())) {
        loaded.sort((a, b) => b.updatedAt - a.updatedAt);
        loaded.splice(1);
        set({ conversations: loaded, activeId: loaded[0]?.id ?? null });
        if (loaded[0]) void get().loadMessagesForConversation(loaded[0].id);
        return;
      }

      set({ conversations: loaded });
      const currentActiveId = get().activeId;
      if (currentActiveId && loaded.some((c) => c.id === currentActiveId)) {
        void get().loadMessagesForConversation(currentActiveId);
      } else if (currentActiveId) {
        // e.g. a guest chat that was open before signing in: it isn't on the server, so close it.
        set({ activeId: null });
      }
    } catch {
      get().pushToast("Couldn't load your conversation history.");
    }
  },

  loadMessagesForConversation: async (id) => {
    const conversation = get().conversations.find((c) => c.id === id);
    if (!conversation?.conversationId) return; // not registered server-side yet, nothing to fetch
    // Already have this session's messages locally, don't overwrite. Cached ones still get refreshed.
    if (conversation.messages.length > 0 && !staleIds.has(id)) return;

    const pending = messageLoads.get(id);
    if (pending) return pending;

    const shown = conversation.messages;
    const load = (async () => {
      try {
        const response = await listConversationMessages(conversation.conversationId!);
        const messages: Message[] = response.messages.map((m) => ({
          id: m.message_id,
          role: m.role,
          content: m.content,
          createdAt: new Date(m.created_at).getTime(),
          status: "complete",
        }));
        staleIds.delete(id);

        const current = get().conversations.find((c) => c.id === id);
        // Something was added locally while loading cached messages: keep that rather than overwrite it.
        if (!current || (shown.length > 0 && current.messages !== shown)) return;
        const next = reuseUnchanged(current.messages, messages);
        if (next === current.messages) return;

        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, messages: next } : c)),
        }));
        storage.saveConversations(get().conversations);
      } catch {
        get().pushToast("Couldn't load messages for this conversation");
      } finally {
        messageLoads.delete(id);
      }
    })();
    messageLoads.set(id, load);
    return load;
  },

  waitForConversationId: async (id) => {
    const pending = registrations.get(id);
    if (pending) await pending;
    return get().conversations.find((c) => c.id === id)?.conversationId ?? null;
  },

  resolveConversation: async (id) => {
    const conversationId = await get().waitForConversationId(id);
    return { ok: conversationId !== null, conversationId };
  },

  startGuestSession: () => {
    set({ conversations: [], activeId: null, pendingConversationIds: [] });
    storage.clearChatCache();
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