/** Server-rendered dashboard pieces: stat tiles, horizontal bar lists, panels. */

export function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-rule bg-surface p-4 sm:p-5 ${className}`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">{title}</h2>
        {note ? <p className="font-mono text-[11px] text-ink-faint">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value, delta, hint }: { label: string; value: string; delta?: number | null; hint?: string }) {
  return (
    <div className="border border-rule bg-surface px-4 py-3">
      <p className="text-[13px] text-ink-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl text-ink">{value}</p>
      {delta !== undefined && delta !== null ? (
        <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs previous period
        </p>
      ) : hint ? (
        <p className="mt-0.5 font-mono text-[11px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

/** Horizontal bars with the value always printed — no tooltip needed. */
export function BarList({ rows, unit, empty = "No data yet." }: { rows: { key: string; label: React.ReactNode; value: number }[]; unit: string; empty?: string }) {
  if (!rows.length) return <p className="font-mono text-[12px] text-ink-faint">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((n, r) => n + r.value, 0) || 1;
  return (
    <ul className="space-y-2" aria-label={`values in ${unit}`}>
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <span className="truncate text-[13px] text-ink">{r.label}</span>
          <span className="font-mono text-[12px] text-ink tabular-nums">
            {r.value} <span className="text-ink-faint">· {Math.round((r.value / total) * 100)}%</span>
          </span>
          <span className="col-span-2 block h-2 w-full bg-rule-faint">
            <span className="block h-2 rounded-r-[4px] bg-chart" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Country-code badge (flag emoji don't render on Windows, so no emoji). */
export function CountryCode({ code }: { code: string }) {
  return (
    <span className="mr-1.5 inline-block w-7 border border-rule px-1 text-center font-mono text-[11px] text-ink-muted">
      {/^[A-Z]{2}$/.test(code) ? code : "—"}
    </span>
  );
}

const names = new Intl.DisplayNames(["en"], { type: "region" });
export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "Unknown (local / no geo header)";
  try {
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

export function duration(ms: number): string {
  if (!ms) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${String(s % 60).padStart(2, "0")}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}
