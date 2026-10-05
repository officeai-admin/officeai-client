import { useAuthStore } from "@/store/authStore";

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL;

export interface ChatResponse {
  answer: string;
  session_id: string;
  used_context_count: number;
  route: string;
  [key: string]: unknown;
}

export async function sendChatMessage(
  question: string,
  sessionId: string,
  conversationId?: string | null
): Promise<ChatResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(`${RAG_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, session_id: sessionId, ...(conversationId ? { conversation_id: conversationId } : {}), }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  return (await response.json()) as ChatResponse;
}

export interface UploadDocumentResponse {
  status: string;
  filename: string;
  chunks_stored: number;
  document: {
    doc_id: string;
    scope: string;
    session_id: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function uploadDocument(
  file: File,
  sessionId: string,
  scope: "user" | "session" = "user",
  conversationId?: string | null
): Promise<UploadDocumentResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const form = new FormData();
  form.append("file", file);
  form.append("scope", scope);
  form.append("session_id", sessionId);
  if (conversationId) {
    form.append("conversation_id", conversationId);
  }

  const response = await fetch(`${RAG_API_URL}/upload_doc_qdrant_hybrid`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return (await response.json()) as UploadDocumentResponse;
}

export interface ConversationSummary {
  conversation_id: string;
  user_id: string;
  title: string;
  title_source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationResponse {
  status: string;
  conversation: ConversationSummary;
  [key: string]: unknown;
}

export async function createConversation(title?: string): Promise<CreateConversationResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(`${RAG_API_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: title ? JSON.stringify({ title }) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.status}`);
  }

  return (await response.json()) as CreateConversationResponse;
}

export interface ListConversationsResponse {
  status: string;
  conversations: ConversationSummary[];
  [key: string]: unknown;
}

export async function listConversations(): Promise<ListConversationsResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(`${RAG_API_URL}/conversations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list conversations: ${response.status}`);
  }

  return (await response.json()) as ListConversationsResponse;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(`${RAG_API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.status}`);
  }
}

export interface ConversationMessage {
  message_id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ListMessagesResponse {
  status: string;
  conversation_id: string;
  messages: ConversationMessage[];
  [key: string]: unknown;
}

export async function listConversationMessages(
  conversationId: string,
  limit = 100
): Promise<ListMessagesResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(
    `${RAG_API_URL}/conversations/${conversationId}/messages?limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load messages: ${response.status}`);
  }

  return (await response.json()) as ListMessagesResponse;
}