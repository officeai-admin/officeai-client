import { X, File as FileIcon, FileText, Image as ImageIcon } from "lucide-react";
import type { Attachment } from "@/types/chat";
import { formatBytes, cn } from "@/utils/helpers";

function fileIconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return ImageIcon;
  if (ext === "pdf" || ext === "txt") return FileText;
  return FileIcon;
}

export function FileAttachments({
  attachments,
  onRemove,
}: {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {attachments.map((f) => {
        const isImage = f.type?.startsWith("image/") && f.url;
        const Icon = fileIconFor(f.name);
        return (
          <div
            key={f.id}
            className={cn(
              "flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 text-xs text-foreground",
              f.uploadStatus === "error" && "text-destructive"
            )}
          >
            {isImage ? (
              <img src={f.url} alt={f.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <Icon size={13} />
            )}
            <span>{f.name}</span>
            {f.uploadStatus === "uploading" && <span className="text-muted-foreground">Uploading…</span>}
            {f.uploadStatus === "error" && <span>Upload failed</span>}
            {(!f.uploadStatus || f.uploadStatus === "uploaded") && (
              <span className="text-muted-foreground">{formatBytes(f.size)}</span>
            )}
            <button aria-label={`Remove ${f.name}`} onClick={() => onRemove(f.id)} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}