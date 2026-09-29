"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Privacy-first page analytics: one beacon when a page is shown, then its
 * engaged time (counted only while the tab is visible) at 5s, 15s, 30s and
 * every 30s after, plus on hide and on route change. The early heartbeats
 * mean a view still counts if the final unload beacon is lost. Honors Do-Not-Track and Global Privacy Control;
 * never runs on /admin. Data: /api/pv → Neon → /admin.
 */

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

function send(body: Record<string, unknown>) {
  try {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/pv", blob)) {
      void fetch("/api/pv", { method: "POST", body: JSON.stringify(body), keepalive: true }).catch(() => {});
    }
  } catch {
    /* analytics must never break the page */
  }
}

function optedOut(): boolean {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };
  return n.globalPrivacyControl === true || n.doNotTrack === "1";
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem("div1-session");
    if (!s) {
      s = uid();
      sessionStorage.setItem("div1-session", s);
    }
    return s;
  } catch {
    return uid();
  }
}

export function PageTracker() {
  const path = usePathname();

  useEffect(() => {
    if (!path || path.startsWith("/admin") || optedOut()) return;
    const id = uid();
    let engaged = 0;
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    const total = () => engaged + (visibleSince !== null ? performance.now() - visibleSince : 0);
    const flush = () => send({ kind: "time", id, ms: Math.round(total()) });

    const params = new URLSearchParams(window.location.search);
    send({
      kind: "view",
      id,
      session: sessionId(),
      path,
      ref: document.referrer,
      w: window.innerWidth,
      utm: params.get("utm_source") ?? params.get("ref") ?? undefined,
    });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince !== null) engaged += performance.now() - visibleSince;
        visibleSince = null;
        flush();
      } else {
        visibleSince = performance.now();
      }
    };
    const beat = () => document.visibilityState === "visible" && flush();
    const early = [5_000, 15_000].map((ms) => setTimeout(beat, ms));
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    const steady = setTimeout(() => {
      beat();
      heartbeat = setInterval(beat, 30_000);
    }, 30_000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush(); // route change: close out this view
      early.forEach(clearTimeout);
      clearTimeout(steady);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [path]);

  return null;
}
