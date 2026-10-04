import { useRef, useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocument, type UploadDocumentResponse } from "@/services/chatApiService";
import { useChatStore } from "@/store/chatStore";

export function PdfDataExtractor() {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadDocumentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeId = useChatStore((s) => s.activeId);
  const newConversation = useChatStore((s) => s.newConversation);

  const reset = () => {
    setFileName(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const onFileSelected = (selected: File | undefined) => {
    if (!selected) return;
    reset();
    setFileName(selected.name);
    setFile(selected);
  };

  const extract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const sessionId = activeId ?? newConversation();
      const response = await uploadDocument(file, sessionId, "user");
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        aria-label="PDF data extractor"
        onClick={() => setOpen(true)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
      >
        <FileText size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">PDF Data Extractor</span>
              <button aria-label="Close" onClick={close} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {!fileName ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted"
              >
                Click to choose a PDF
              </button>
            ) : (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                <FileText size={15} />
                <span className="truncate">{fileName}</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />

            {fileName && (
              <div className="mt-3 space-y-3">
                <Button size="sm" onClick={extract} disabled={loading}>
                  {loading ? "Uploading…" : "Upload to Knowledge Base"}
                </Button>

                {error && <p className="text-xs text-destructive">{error}</p>}

                {result && (
                  <div className="space-y-1.5 rounded-lg bg-muted p-3 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                        Uploaded
                      </span>
                      <span className="text-xs text-muted-foreground">{result.chunks_stored} chunks stored</span>
                    </div>
                    <p className="text-muted-foreground">Doc ID: {result.document.doc_id}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}