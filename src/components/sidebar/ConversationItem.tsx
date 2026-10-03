import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Conversation } from "@/types/chat";
import { cn } from "@/utils/helpers";

export function ConversationItem({
  conversation,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [value, setValue] = useState(conversation.title);

  const commit = () => {
    if (value.trim()) onRename(value.trim());
    setRenaming(false);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer",
        active ? "bg-muted" : "hover:bg-muted/60"
      )}
    >
      {renaming ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setRenaming(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded border border-border bg-card px-1.5 py-0.5 text-sm text-foreground"
        />
      ) : (
        <span className="truncate text-foreground">{conversation.title}</span>
      )}

      {!renaming && (
        <div className="relative">
          <button
            aria-label="Conversation options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-6 z-40 w-32 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            >
              <button
                onClick={() => {
                  setRenaming(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
