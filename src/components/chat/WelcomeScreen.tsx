import { Sparkles } from "lucide-react";
import { SUGGESTIONS } from "@/data/mockData";

export function WelcomeScreen({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
        <Sparkles size={22} className="text-accent-foreground" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Hello!</h1>
      <p className="mb-6 text-2xl font-semibold text-muted-foreground">How can I help you today?</p>

      <div className="grid grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="flex w-[200px] flex-col items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left hover:bg-muted"
          >
            <s.icon size={17} className="text-accent" />
            <span className="text-sm text-foreground">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
