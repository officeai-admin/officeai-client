const RAG_API_URL = import.meta.env.VITE_RAG_API_URL;

export type HealthStatus = "online" | "offline";

export async function checkBackendHealth(): Promise<HealthStatus> {
  if (!RAG_API_URL) return "offline";

  try {
    const response = await fetch(`${RAG_API_URL}/health`);
    if (!response.ok) return "offline";

    const data = await response.json();
    return data.status === "ok" ? "online" : "offline";
  } catch {
    return "offline"; // network error, CORS block, backend down, etc.
  }
}