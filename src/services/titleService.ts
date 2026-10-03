export interface GeneratedTitle {
  title: string;
  emoji: string;
}

export async function generateTitle(message: string): Promise<GeneratedTitle | null> {
  try {
    const response = await fetch("/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) return null;
    return (await response.json()) as GeneratedTitle;
  } catch {
    return null; // title generation is a nice-to-have; never block the chat on it
  }
}