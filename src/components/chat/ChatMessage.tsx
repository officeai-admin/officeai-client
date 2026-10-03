import { useState } from "react";
import { Sparkles, User, FileText, File as FileIcon, Image as ImageIcon } from "lucide-react";
import type { Message } from "@/types/chat";
import { Markdown } from "./Markdown";
import { MessageActions } from "./MessageActions";
import { TypingIndicator } from "./TypingIndicator";
import { formatBytes } from "@/utils/helpers";

function fileIconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return ImageIcon;
  if (ext === "pdf" || ext === "txt") return FileText;
  return FileIcon;
}

export function ChatMessage({
  message,
  isLast,
  onEdit,
  onRegenerate,
  onFeedback,
}: {
  message: Message;
  isLast: boolean;
  onEdit: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
  onFeedback: (messageId: string, kind: "up" | "down") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const isUser = message.role === "user";

  const saveEdit = () => {
    if (draft.trim() && draft !== message.content) onEdit(message.id, draft.trim());
    setEditing(false);
  };

  return (
    <div className="group mx-auto flex w-full max-w-[780px] gap-3 px-1.5 py-3.5">
      <div
        className={
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full " +
          (isUser ? "bg-muted text-foreground" : "bg-accent text-accent-foreground")
        }
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-xs font-semibold text-muted-foreground">{isUser ? "You" : "Assistant"}</div>

        {editing ? (
          <div>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.min(8, Math.max(2, draft.split("\n").length))}
              className="w-full resize-y rounded-lg border border-border bg-muted p-2.5 text-[15px] text-foreground"
            />
            <div className="mt-2 flex gap-2">
              <button onClick={saveEdit} className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-foreground">
                Save &amp; submit
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(message.content);
                }}
                className="rounded-lg border border-border px-3.5 py-1.5 text-sm text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{message.content}</div>
        ) : (
          <Markdown content={message.content} />
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.attachments.map((f) => {
              const isImage = f.type?.startsWith("image/") && f.url;
              const Icon = fileIconFor(f.name);
              return (
                <div key={f.id} className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {isImage ? <img src={f.url} alt={f.name} className="h-4 w-4 rounded object-cover" /> : <Icon size={13} />}
                  {f.name} <span className="text-muted-foreground/70">{formatBytes(f.size)}</span>
                </div>
              );
            })}
          </div>
        )}

        {message.status === "streaming" && message.content === "" && <TypingIndicator />}

        {message.status === "error" && (
          <div className="mt-1 flex items-center gap-2.5">
            <span className="text-sm text-destructive">
              {message.error || "Something went wrong while generating the response."}
            </span>
            <button
              onClick={() => onRegenerate(message.id)}
              className="rounded-lg border border-border px-2.5 py-1 text-xs text-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {!editing && message.status !== "streaming" && (
          <MessageActions
            message={message}
            isLast={isLast}
            onEdit={isUser ? () => setEditing(true) : undefined}
            onCopy={() => navigator.clipboard?.writeText(message.content)}
            onRegenerate={!isUser ? () => onRegenerate(message.id) : undefined}
            onFeedback={!isUser ? (kind) => onFeedback(message.id, kind) : undefined}
          />
        )}
      </div>
    </div>
  );
}
