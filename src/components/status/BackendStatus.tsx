import { useEffect, useState } from "react";
import { checkBackendHealth, type HealthStatus } from "@/services/healthService";

type DisplayStatus = HealthStatus | "checking";

const CHECK_INTERVAL_MS = 30_000; // re-check every 30 seconds

export function BackendStatus() {
  const [status, setStatus] = useState<DisplayStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      const result = await checkBackendHealth();
      if (!cancelled) setStatus(result);
    };

    runCheck(); // check immediately on mount
    const interval = setInterval(runCheck, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const color =
    status === "online" ? "bg-green-500" : status === "offline" ? "bg-red-500" : "bg-muted-foreground";

  const label =
    status === "online" ? "Backend online" : status === "offline" ? "Backend offline" : "Checking backend…";

  return (
    <div className="flex items-center gap-1.5 px-1" title={label}>
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}