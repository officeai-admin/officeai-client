import { useState } from "react";
import { Search, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamResearch, type ResearchSource } from "@/services/researchService";
import { Markdown } from "@/components/chat/Markdown";

export function ResearchAgent() {
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");
    const [sources, setSources] = useState<ResearchSource[]>([]);
    const [error, setError] = useState<string | null>(null);

    const close = () => {
        setOpen(false);
        setTopic("");
        setSummary("");
        setSources([]);
        setError(null);
    };

    const run = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        setSummary("");
        setSources([]);

        try {
            await streamResearch(topic.trim(), (update) => {
                if (update.textDelta) setSummary((prev) => prev + update.textDelta);
                if (update.sources) setSources(update.sources);
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Research failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                aria-label="Research agent"
                onClick={() => setOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
                <Search size={16} />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-lg">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Research Agent</span>
                            <button aria-label="Close" onClick={close} className="text-muted-foreground hover:text-foreground">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && run()}
                                placeholder="What do you want researched?"
                                className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                            />
                            <Button size="sm" onClick={run} disabled={loading || !topic.trim()}>
                                {loading ? "Researching…" : "Research"}
                            </Button>
                        </div>

                        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

                        {/* {summary && <div className="mt-4 whitespace-pre-wrap text-sm text-foreground">{summary}</div>} */}

                        {summary && (
                            <div className="mt-4 text-sm text-foreground">
                                <Markdown content={summary} />
                            </div>
                        )}

                        {loading && !summary && <p className="mt-4 text-xs text-muted-foreground">Searching the web…</p>}

                        {sources.length > 0 && (
                            <div className="mt-4 border-t border-border pt-3">
                                <p className="mb-2 text-xs font-medium text-muted-foreground">Sources</p>
                                <ul className="space-y-1.5">
                                    {sources.map((s) => (
                                        <li key={s.url}>
                                            <a
                                                href={s.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                                            >
                                                <ExternalLink size={12} />
                                                <span className="truncate">{s.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}