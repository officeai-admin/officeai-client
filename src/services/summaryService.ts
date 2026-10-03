export interface ConversationSummary {
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
}

export async function streamConversationSummary(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  onUpdate: (partial: ConversationSummary) => void
): Promise<void> {
  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Summary request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep any incomplete trailing line for next chunk

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        onUpdate(JSON.parse(line) as ConversationSummary);
      } catch {
        // partial/corrupt line — the next line supersedes it, safe to ignore
      }
    }
  }
}