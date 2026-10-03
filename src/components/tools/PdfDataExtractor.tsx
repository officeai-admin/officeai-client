import { useRef, useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfExtraction {
  documentType: string;
  title: string;
  date: string | null;
  parties: string[];
  amounts: { label: string; value: string }[];
  summary: string;
}

export function PdfDataExtractor() {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PdfExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFileName(null);
    setBase64(null);
    setData(null);
    setError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const onFileSelected = (file: File | undefined) => {
    if (!file) return;
    reset();
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBase64(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  };

  const extract = async () => {
    if (!base64) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf: base64, filename: fileName }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed: ${response.status}`);
      }
      setData((await response.json()) as PdfExtraction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract data");
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
                  {loading ? "Extracting…" : "Extract Data"}
                </Button>

                {error && <p className="text-xs text-destructive">{error}</p>}

                {data && (
                  <div className="space-y-2.5 rounded-lg bg-muted p-3 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                        {data.documentType}
                      </span>
                      {data.date && <span className="text-xs text-muted-foreground">{data.date}</span>}
                    </div>
                    <p className="font-medium">{data.title}</p>
                    <p className="text-muted-foreground">{data.summary}</p>

                    {data.parties.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Parties</p>
                        <p>{data.parties.join(", ")}</p>
                      </div>
                    )}

                    {data.amounts.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Amounts</p>
                        <ul className="space-y-0.5">
                          {data.amounts.map((a, i) => (
                            <li key={i} className="flex justify-between">
                              <span className="text-muted-foreground">{a.label}</span>
                              <span>{a.value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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