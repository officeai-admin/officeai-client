import { useChatStore } from "@/store/chatStore";

export function ToastStack() {
  const toasts = useChatStore((s) => s.toasts);

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
