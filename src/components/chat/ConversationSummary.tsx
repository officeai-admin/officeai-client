import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamConversationSummary, type ConversationSummary as SummaryData } from "@/services/summaryService";
import type { Message } from "@/types/chat";

export function ConversationSummaryPanel({ messages }: { messages: Message[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setData(null);

    const history = messages
      .filter((m) => m.content.trim() !== "")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      await streamConversationSummary(history, (partial) => setData(partial));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={run} disabled={messages.length === 0}>
        <Sparkles size={14} />
        Summarize
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Conversation summary</span>
            <button aria-label="Close" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {!error && (
            <div className="space-y-3 text-sm">
              <p className="text-foreground">{data?.summary ?? (loading ? "Thinking…" : "")}</p>

              {data?.keyPoints && data.keyPoints.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Key points</p>
                  <ul className="list-disc space-y-0.5 pl-4 text-foreground">
                    {data.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data?.actionItems && data.actionItems.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Action items</p>
                  <ul className="list-disc space-y-0.5 pl-4 text-foreground">
                    {data.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {loading && !data?.summary && <p className="text-xs text-muted-foreground">Generating…</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}