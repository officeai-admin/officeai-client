import { useAuthStore } from "@/store/authStore";

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL;

export interface ChatResponse {
  answer: string;
  session_id: string;
  used_context_count: number;
  route: string;
  [key: string]: unknown; // other diagnostic fields we don't need to type strictly
}

export async function sendChatMessage(
  question: string,
  sessionId: string
): Promise<ChatResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(`${RAG_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, session_id: sessionId }),
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
  scope: "user" | "session" = "user"
): Promise<UploadDocumentResponse> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) throw new Error("Not signed in");

  const form = new FormData();
  form.append("file", file);
  form.append("scope", scope);
  form.append("session_id", sessionId);

  const response = await fetch(`${RAG_API_URL}/upload_doc_qdrant_hybrid`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets the multipart boundary
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return (await response.json()) as UploadDocumentResponse;
}