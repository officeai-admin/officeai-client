import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Hand-rolled stand-in for prompt-kit's <CodeBlock>. Swap the import in
 * Markdown.tsx for `@/components/ui/prompt-kit/code-block` once installed —
 * same props shape (code, lang).
 */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-2.5 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        <span>{lang || "text"}</span>
        <button onClick={onCopy} className="flex items-center gap-1 hover:text-foreground">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-muted/60 p-3.5">
        <code className="font-mono text-[13px] text-foreground">{code}</code>
      </pre>
    </div>
  );
}
