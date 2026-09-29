/**
 * Fire-and-forget UI event (see /api/event for the accepted names). Uses
 * sendBeacon so it never delays navigation; silently no-ops if unavailable.
 */
export function beacon(name: string, detail?: Record<string, unknown>): void {
  try {
    const body = JSON.stringify({ name, detail });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/event", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* telemetry must never break the UI */
  }
}
