import { useMemo } from "react";
import { CodeBlock } from "./CodeBlock";

/**
 * Minimal markdown renderer (headings, bold, italic, links, inline code,
 * fenced code blocks, lists). Swap for prompt-kit's <Markdown> component
 * (`@/components/ui/prompt-kit/markdown`) once installed for full GFM
 * support — same `content` prop.
 */

type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "ul"; items: string[] }
  | { type: "space" };

function parseBlocks(content: string): Block[] {
  const out: Block[] = [];
  const lines = content.split("\n");
  let i = 0;
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      out.push({ type: "ul", items: listBuffer });
      listBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trimStart();
    if (trimmedLine.startsWith("```")) {
      const lang = trimmedLine.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {  // ← trimStart() added here too
        codeLines.push(lines[i]);
        i++;
      }
      flushList();
      out.push({ type: "code", lang, code: codeLines.join("\n") });
      i++;
      continue;
    }
    if (/^###\s+/.test(line)) { flushList(); out.push({ type: "h3", text: line.replace(/^###\s+/, "") }); i++; continue; }
    if (/^##\s+/.test(line)) { flushList(); out.push({ type: "h2", text: line.replace(/^##\s+/, "") }); i++; continue; }
    if (/^#\s+/.test(line)) { flushList(); out.push({ type: "h1", text: line.replace(/^#\s+/, "") }); i++; continue; }
    if (/^[-*]\s+/.test(line)) { listBuffer.push(line.replace(/^[-*]\s+/, "")); i++; continue; }
    if (/^\d+\.\s+/.test(line)) { listBuffer.push(line.replace(/^\d+\.\s+/, "")); i++; continue; }
    flushList();
    if (line.trim() === "") { out.push({ type: "space" }); i++; continue; }
    out.push({ type: "p", text: line });
    i++;
  }
  flushList();
  return out;
}

function InlineMarkdown({ text }: { text: string }) {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++} className="font-semibold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key++} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const m2 = token.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      parts.push(
        <a key={key++} href={m2[2]} target="_blank" rel="noreferrer" className="text-accent underline">
          {m2[1]}
        </a>
      );
    } else if (token.startsWith("*")) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

export function Markdown({ content }: { content: string }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className="text-[15px] leading-relaxed text-foreground">
      {blocks.map((b, idx) => {
        if (b.type === "h1") return <h1 key={idx} className="mb-1.5 mt-3.5 text-xl font-semibold"><InlineMarkdown text={b.text} /></h1>;
        if (b.type === "h2") return <h2 key={idx} className="mb-1.5 mt-3.5 text-lg font-semibold"><InlineMarkdown text={b.text} /></h2>;
        if (b.type === "h3") return <h3 key={idx} className="mb-1.5 mt-3.5 text-base font-semibold"><InlineMarkdown text={b.text} /></h3>;
        if (b.type === "code") return <CodeBlock key={idx} code={b.code} lang={b.lang} />;
        if (b.type === "ul")
          return (
            <ul key={idx} className="my-1.5 list-disc pl-5">
              {b.items.map((it, j) => (
                <li key={j} className="my-0.5"><InlineMarkdown text={it} /></li>
              ))}
            </ul>
          );
        if (b.type === "space") return <div key={idx} className="h-1.5" />;
        return <p key={idx} className="my-1"><InlineMarkdown text={b.text} /></p>;
      })}
    </div>
  );
}
