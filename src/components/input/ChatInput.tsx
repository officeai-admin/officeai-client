import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import type { Attachment } from "@/types/chat";
import { FileAttachments } from "./FileAttachments";
import { uid, cn, readFileAsDataUrl } from "@/utils/helpers";
import { useChatStore } from "@/store/chatStore";
import { uploadDocument } from "@/services/chatApiService";

const MAX_FILE_BYTES = 6 * 1024 * 1024; // 6MB — stays under the server's 10MB JSON body limit once base64-encoded

function isSupportedFile(file: File) {
  return file.type.startsWith("image/") || file.type === "application/pdf";
}

export function ChatInput({
  onSend,
  disabled,
  onStop,
  sendBlocked = false,
}: {
  onSend: (text: string, attachments: Attachment[]) => void;
  disabled: boolean;
  onStop?: () => void;
  sendBlocked?: boolean;
}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pushToast = useChatStore((s) => s.pushToast);
  const activeId = useChatStore((s) => s.activeId);
  const newConversation = useChatStore((s) => s.newConversation);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(200, el.scrollHeight)}px`;
  }, [value]);

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList || sendBlocked) return;

    const sessionId = activeId ?? newConversation();

    for (const file of Array.from(fileList)) {
      if (!isSupportedFile(file)) {
        pushToast(`${file.name}: only images and PDFs are supported`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        pushToast(`${file.name}: file is too large (max 6MB)`);
        continue;
      }

      let url: string | undefined;
      try {
        url = await readFileAsDataUrl(file);
      } catch {
        pushToast(`${file.name}: failed to read file`);
        continue;
      }

      const attachmentId = uid();
      setAttachments((previous) => [
        ...previous,
        { id: attachmentId, name: file.name, size: file.size, type: file.type, url, uploadStatus: "uploading" },
      ]);

      try {
        const conversationId = await useChatStore.getState().waitForConversationId(sessionId);
        if (!conversationId) throw new Error("Chat not registered");
        const result = await uploadDocument(file, sessionId, undefined, conversationId);
        setAttachments((previous) =>
          previous.map((a) =>
            a.id === attachmentId ? { ...a, uploadStatus: "uploaded", docId: result.document.doc_id } : a
          )
        );
      } catch {
        setAttachments((previous) =>
          previous.map((a) => (a.id === attachmentId ? { ...a, uploadStatus: "error" } : a))
        );
        pushToast(`${file.name}: upload failed`);
      }
    }
  };

  const submit = () => {
    if (disabled || sendBlocked || attachments.some((a) => a.uploadStatus === "uploading")) return;
    if (!value.trim() && attachments.length === 0) return;
    onSend(value.trim(), attachments);
    setValue("");
    setAttachments([]);
  };

  const isUploading = attachments.some((a) => a.uploadStatus === "uploading");
  const isEmpty = !value.trim() && attachments.length === 0;

  return (
    <div className="px-4 pb-4 pt-2.5">
      <div
        className="mx-auto max-w-[780px]"
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void addFiles(event.dataTransfer.files);
        }}
      >
        <FileAttachments
          attachments={attachments}
          onRemove={(id) =>
            setAttachments((previous) => previous.filter((file) => file.id !== id))
          }
        />

        <div
          className={cn(
            "flex items-end gap-2 rounded-[18px] border bg-muted px-2.5 py-2.5",
            dragOver ? "border-accent" : "border-border"
          )}
        >
          <button
            aria-label="Attach file"
            disabled={disabled || sendBlocked}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-card disabled:opacity-50"
          >
            <Paperclip size={17} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            onChange={(event) => {
              void addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            placeholder="Ask anything..."
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            className="max-h-[200px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground disabled:opacity-60"
          />

          {disabled ? (
            <button
              aria-label="Stop generating"
              onClick={onStop}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              aria-label="Send message"
              disabled={isEmpty || isUploading || sendBlocked}
              onClick={submit}
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                isEmpty || isUploading || sendBlocked
                  ? "bg-border text-muted-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>

        <div className="mt-1.5 text-center text-[11px] text-muted-foreground">
          Office AI can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
}
