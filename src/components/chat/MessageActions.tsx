import { useState } from "react";
import { Check, Copy, Pencil, ThumbsDown, ThumbsUp, RotateCcw, MoreHorizontal } from "lucide-react";
import type { Message } from "@/types/chat";
import { cn } from "@/utils/helpers";

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 hover:bg-muted",
        active ? "text-accent" : "text-muted-foreground"
      )}
    >
      <Icon size={14} />
    </button>
  );
}

export function MessageActions({
  message,
  isLast,
  onEdit,
  onCopy,
  onRegenerate,
  onFeedback,
}: {
  message: Message;
  isLast: boolean;
  onEdit?: () => void;
  onCopy: () => void;
  onRegenerate?: () => void;
  onFeedback?: (kind: "up" | "down") => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  if (message.role === "user") {
    return (
      <div className="mt-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {onEdit && <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />}
        <ActionButton icon={copied ? Check : Copy} label={copied ? "Copied!" : "Copy"} onClick={copy} />
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <ActionButton icon={copied ? Check : Copy} label={copied ? "Copied!" : "Copy"} onClick={copy} />
      <ActionButton
        icon={ThumbsUp}
        label="Like"
        active={message.feedback === "up"}
        onClick={() => onFeedback?.("up")}
      />
      <ActionButton
        icon={ThumbsDown}
        label="Dislike"
        active={message.feedback === "down"}
        onClick={() => onFeedback?.("down")}
      />
      {isLast && onRegenerate && <ActionButton icon={RotateCcw} label="Regenerate" onClick={onRegenerate} />}
      <ActionButton icon={MoreHorizontal} label="More" onClick={() => {}} />
    </div>
  );
}
