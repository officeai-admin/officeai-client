import { useRef, useState } from "react";
import { Image as ImageIcon, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AltTextGenerator() {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [loading, setLoading] = useState(false);
  const [altText, setAltText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreviewUrl(null);
    setBase64(null);
    setAltText(null);
    setError(null);
    setCopied(false);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const onFileSelected = (file: File | undefined) => {
    if (!file) return;
    reset();
    setMimeType(file.type || "image/png");

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      // Strip the "data:image/png;base64," prefix — the backend just wants the raw payload.
      setBase64(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!base64) return;
    setLoading(true);
    setError(null);
    setAltText(null);

    try {
      const response = await fetch("/api/alt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed: ${response.status}`);
      }
      const data = (await response.json()) as { altText: string };
      setAltText(data.altText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate alt text");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!altText) return;
    await navigator.clipboard.writeText(altText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <button
        aria-label="Alt text generator"
        onClick={() => setOpen(true)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
      >
        <ImageIcon size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Alt Text Generator</span>
              <button aria-label="Close" onClick={close} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {!previewUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted"
              >
                Click to choose an image
              </button>
            ) : (
              <img src={previewUrl} alt="Selected preview" className="mb-3 max-h-56 w-full rounded-lg object-contain" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />

            {previewUrl && (
              <div className="mt-3 space-y-3">
                <Button size="sm" onClick={generate} disabled={loading}>
                  {loading ? "Generating…" : "Generate Alt Text"}
                </Button>

                {error && <p className="text-xs text-destructive">{error}</p>}

                {altText && (
                  <div className="rounded-lg bg-muted p-3 text-sm text-foreground">
                    <p>{altText}</p>
                    <button
                      onClick={copyToClipboard}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
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