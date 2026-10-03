import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/utils/helpers";

const OPTIONS = [
  { key: "light" as const, icon: Sun, label: "Light" },
  { key: "dark" as const, icon: Moon, label: "Dark" },
  { key: "system" as const, icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { theme, isDark, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Theme"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted"
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </button>
      {open && (
        <div className="absolute bottom-9 left-1/2 z-40 w-32 -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => {
                setTheme(o.key);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                theme === o.key ? "text-accent" : "text-foreground"
              )}
            >
              <o.icon size={14} /> {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
