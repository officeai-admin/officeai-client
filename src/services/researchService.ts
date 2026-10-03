export interface ResearchSource {
  title: string;
  url: string;
  content: string;
}

export interface ResearchUpdate {
  textDelta?: string;
  sources?: ResearchSource[];
}

export async function streamResearch(
  topic: string,
  onUpdate: (update: ResearchUpdate) => void
): Promise<void> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Research request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as {
          type: "text" | "sources";
          value: string | ResearchSource[];
        };
        if (parsed.type === "text") {
          onUpdate({ textDelta: parsed.value as string });
        } else if (parsed.type === "sources") {
          onUpdate({ sources: parsed.value as ResearchSource[] });
        }
      } catch {
        // malformed/partial line — safe to ignore
      }
    }
  }
}