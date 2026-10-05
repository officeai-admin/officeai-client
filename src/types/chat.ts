export type Role = "user" | "assistant" | "system";
export type MessageStatus = "streaming" | "complete" | "error";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type?: string;
  url?: string;
  uploadStatus?: "uploading" | "uploaded" | "error";
  docId?: string; 
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  status: MessageStatus;
  attachments?: Attachment[];
  feedback?: "up" | "down";
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  messages: Message[];
  conversationId: string | null;
}

export const MODELS = [
  "GPT-Style Assistant",
  "Fast Assistant",
  "Reasoning Assistant",
] as const;

export type ModelName = (typeof MODELS)[number];
