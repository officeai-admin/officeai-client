import type { Conversation } from "@/types/chat";
import { uid } from "@/utils/helpers";
import { MODELS } from "@/types/chat";
import { Lightbulb, Code2, Bug, Sparkles } from "lucide-react";

export function seedConversations(): Conversation[] {
  const now = Date.now();
  const mk = (title: string, offsetMs: number): Conversation => ({
    id: uid(),
    title,
    createdAt: now - offsetMs,
    updatedAt: now - offsetMs,
    model: MODELS[0],
    messages: [],
  });

  return [
    mk("Help with React project", 1000 * 60 * 20),
    mk("Explain Kafka architecture", 1000 * 60 * 60 * 26),
    mk("Java microservices design", 1000 * 60 * 60 * 30),
    mk("Debugging Spring Boot", 1000 * 60 * 60 * 24 * 4),
    mk("Database optimization", 1000 * 60 * 60 * 24 * 12),
  ];
}

export const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain a complex concept" },
  { icon: Code2, text: "Help me write code" },
  { icon: Bug, text: "Debug an error" },
  { icon: Sparkles, text: "Generate ideas" },
];
