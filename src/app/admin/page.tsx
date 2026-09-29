import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ColumnChart } from "@/components/admin/column-chart";
import { BarList, CountryCode, countryName, duration, Panel, Stat } from "@/components/admin/parts";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAdmin, logOut } from "@/lib/admin";
import { loadDashboard, setHandoffStatus } from "@/lib/analytics";
import { db, dbInfo } from "@/lib/db";
import { schemaStatements } from "@/lib/schema";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;

async function updateHandoff(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const status = String(form.get("status"));
  if (status === "new" || status === "answered" || status === "dismissed") {
    await setHandoffStatus(String(form.get("id")), status);
  }
  revalidatePath("/admin");
}

/** Create / upgrade the tables in whichever database is connected (idempotent). */
async function setUpDatabase() {
  "use server";
  if (!(await isAdmin())) return;
  const sql = db();
  if (!sql) redirect("/admin?setup=no-db");
  let result = "ok";
  try {
    for (const stmt of schemaStatements()) await sql.query(stmt);
  } catch (e) {
    result = encodeURIComponent((e as Error).message.slice(0, 200));
  }
  redirect(`/admin?setup=${result}`);
}

async function signOut() {
  "use server";
  await logOut();
  redirect("/admin/login");
}

const pct = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const weekLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Shown instead of a 500 when the database is missing or failing. */
function DatabaseProblem({ error, setup }: { error: string | null; setup?: string }) {
  const info = dbInfo();
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-16">
      <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">DIV-1 · admin</p>
      <h1 className="text-2xl font-medium tracking-tight">The dashboard can&apos;t read its database</h1>
      {setup && setup !== "ok" ? (
        <p className="border border-accent px-4 py-3 font-mono text-[12px] text-accent">Setup failed: {decodeURIComponent(setup)}</p>
      ) : null}
      <dl className="divide-y divide-rule-faint border-y border-rule font-mono text-[12px]">
        <div className="grid grid-cols-[160px_1fr] gap-3 py-2">
          <dt className="text-ink-faint">variable in use</dt>
          <dd>{info.variable ?? "none — set NeonDB_URI"}</dd>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-3 py-2">
          <dt className="text-ink-faint">database host</dt>
          <dd>{info.host ?? "—"}</dd>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-3 py-2">
          <dt className="text-ink-faint">both variables set</dt>
          <dd>{info.both ? "yes — NeonDB_URI is used; DATABASE_URL (Vercel's Neon integration) is ignored" : "no"}</dd>
        </div>
        {info.problem ? (
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2">
            <dt className="text-ink-faint">value problem</dt>
            <dd className="text-accent">{info.problem}</dd>
          </div>
        ) : null}
        <div className="grid grid-cols-[160px_1fr] gap-3 py-2">
          <dt className="text-ink-faint">error</dt>
          <dd className="break-words text-accent">{error ?? "no database configured"}</dd>
        </div>
      </dl>
      {info.variable ? (
        <form action={setUpDatabase} className="space-y-2">
          <p className="text-[14px] text-ink-muted">
            If the error says a <code>div1_</code> table doesn&apos;t exist, this database was never set up. Create the tables
            here — it&apos;s idempotent and only adds <code>div1_</code> tables and columns.
          </p>
          <button className="border border-accent bg-accent px-4 py-2 font-mono text-[12px] tracking-wider text-paper uppercase hover:bg-transparent hover:text-accent">
            set up database
          </button>
        </form>
      ) : null}
      <form action={signOut}>
        <button className="font-mono text-[11px] text-ink-muted hover:text-accent">sign out</button>
      </form>
    </main>
  );
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ range?: string; setup?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const r = Number(params.range);
  const days = (RANGES as readonly number[]).includes(r) ? r : 30;
  let d: Awaited<ReturnType<typeof loadDashboard>> = null;
  let error: string | null = null;
  try {
    d = await loadDashboard(days);
  } catch (e) {
    error = (e as Error).message;
    console.error("[admin]", error);
  }
  if (!d) return <DatabaseProblem error={error} setup={params.setup} />;
  const k = d.kpi;
  const topCountries = d.countries.slice(0, 10);
  const otherCountries = d.countries.slice(10).reduce((n, c) => n + c.visitors, 0);

  return (
    <div className="min-h-dvh">
      {/* One filter row scopes everything below it. */}
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2">
          <p className="font-mono text-[11px] tracking-[0.18em] text-ink-muted uppercase">
            <span className="text-accent">DIV-1</span> · admin
          </p>
          <nav aria-label="Date range" className="flex gap-1">
            {RANGES.map((n) => (
              <Link
                key={n}
                href={`/admin?range=${n}`}
                aria-current={n === days ? "true" : undefined}
                className={`border px-2.5 py-1 font-mono text-[11px] ${n === days ? "border-accent bg-accent text-paper" : "border-rule text-ink-muted hover:border-accent hover:text-accent"}`}
              >
                {n}d
              </Link>
            ))}
          </nav>
          <p className="font-mono text-[10px] text-ink-faint">last {days} days · times in IST · smoke tests excluded from spend</p>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/" className="font-mono text-[11px] text-ink-muted hover:text-accent">
              view site ↗
            </Link>
            <ThemeToggle />
            <form action={signOut}>
              <button className="font-mono text-[11px] text-ink-muted hover:text-accent">sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Hero: the one number this view leads with. */}
        <section className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <p className="text-[13px] text-ink-muted">Unique visitors</p>
            <p className="font-mono text-5xl text-ink">{k.visitors.toLocaleString()}</p>
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              {pct(k.visitors, k.prevVisitors) === null
                ? "no previous-period data"
                : `${(pct(k.visitors, k.prevVisitors) ?? 0) >= 0 ? "▲" : "▼"} ${Math.abs(pct(k.visitors, k.prevVisitors) ?? 0)}% vs previous ${days} days`}{" "}
              · {k.newVisitors} new
            </p>
          </div>
          {k.handoffsNew ? (
            <a href="#inbox" className="border border-accent px-3 py-2 font-mono text-[12px] text-accent hover:bg-accent hover:text-paper">
              ● {k.handoffsNew} new question{k.handoffsNew > 1 ? "s" : ""} for you →
            </a>
          ) : null}
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8" aria-label="Key numbers">
          <Stat label="Page views" value={k.views.toLocaleString()} delta={pct(k.views, k.prevViews)} />
          <Stat label="Sessions" value={k.sessions.toLocaleString()} />
          <Stat label="Avg. time / session" value={duration(k.avgSessionMs)} hint="engaged time" />
          <Stat label="Pages / session" value={String(k.pagesPerSession)} />
          <Stat label="Questions asked" value={k.questions.toLocaleString()} />
          <Stat label="Reached out" value={k.contacts.toLocaleString()} hint="email / résumé clicks" />
          <Stat label="Open inbox" value={String(k.handoffsNew)} hint="Ask Divanshu" />
          <Stat label="Model spend" value={`$${k.spendUsd.toFixed(4)}`} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Visitors per week" note="last 12 weeks · unique visitors">
            <ColumnChart
              title="Unique visitors per week, last 12 weeks"
              unit="visitors"
              data={d.weekly.map((w) => ({ key: w.week, label: weekLabel(w.week), detail: `Week of ${weekLabel(w.week)} · ${w.views} views`, value: w.visitors }))}
            />
          </Panel>
          <Panel title="Time spent per session" note="engaged (tab visible) time">
            <ColumnChart
              title="Sessions by engaged time"
              unit="sessions"
              data={d.timeBuckets.map((b) => ({ key: b.label, label: b.label, detail: b.label, value: b.sessions }))}
            />
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Countries" note="unique visitors">
            <BarList
              unit="visitors"
              rows={[
                ...topCountries.map((c) => ({
                  key: c.code,
                  label: (
                    <>
                      <CountryCode code={c.code} />
                      {countryName(c.code)}
                    </>
                  ),
                  value: c.visitors,
                })),
                ...(otherCountries ? [{ key: "other", label: `${d.countries.length - 10} more countries`, value: otherCountries }] : []),
              ]}
            />
          </Panel>
          <Panel title="Where they came from" note="utm / referrer / direct">
            <BarList unit="visitors" rows={d.referrers.map((r) => ({ key: r.source, label: r.source, value: r.visitors }))} />
          </Panel>
          <Panel title="Devices & browsers">
            <BarList unit="visitors" rows={d.devices.map((x) => ({ key: x.device, label: x.device, value: x.visitors }))} />
            <div className="mt-4 border-t border-rule-faint pt-3">
              <BarList unit="visitors" rows={d.browsers.map((x) => ({ key: x.browser, label: x.browser, value: x.visitors }))} />
            </div>
          </Panel>
        </div>

        <Panel title="Top pages" note="views · average engaged time per view">
          {d.pages.length ? (
            <table className="report-table w-full text-left text-[13px]">
              <thead>
                <tr className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
                  <th className="py-2 font-medium">Page</th>
                  <th className="py-2 text-right font-medium">Views</th>
                  <th className="py-2 text-right font-medium">Avg. time</th>
                </tr>
              </thead>
              <tbody>
                {d.pages.map((p) => (
                  <tr key={p.path}>
                    <td className="py-1.5 font-mono text-[12px]">{p.path}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{p.views}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{duration(p.avgMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="font-mono text-[12px] text-ink-faint">No page views yet.</p>
          )}
        </Panel>

        <div id="inbox" className="scroll-mt-20">
          <Panel title="Inbox — Ask Divanshu" note="also emailed to you as they arrive">
            {d.handoffs.length ? (
              <ul className="divide-y divide-rule-faint">
                {d.handoffs.map((h) => {
                  const email = h.contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h.contact) ? h.contact : null;
                  return (
                    <li key={h.id} className={`py-3 ${h.status === "new" ? "" : "opacity-60"}`}>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className={`font-mono text-[10px] tracking-wider uppercase ${h.status === "new" ? "text-accent" : "text-ink-faint"}`}>
                          {h.status === "new" ? "● new" : h.status}
                        </span>
                        <span className="font-mono text-[11px] text-ink-faint">{fmtDate(h.at)}</span>
                        <span className="font-mono text-[11px] text-ink-muted">{h.contact ?? "no contact left"}</span>
                      </div>
                      <p className="mt-1 text-[15px] text-ink">“{h.question}”</p>
                      {h.note ? <p className="mt-0.5 text-[13px] text-ink-muted">{h.note}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {email ? (
                          <a
                            href={`mailto:${email}?subject=${encodeURIComponent("Re: your question on my portfolio")}&body=${encodeURIComponent(`Hi,\n\nYou asked on my portfolio: “${h.question}”\n\n`)}`}
                            className="border border-accent px-2.5 py-1 font-mono text-[11px] text-accent hover:bg-accent hover:text-paper"
                          >
                            reply ↗
                          </a>
                        ) : h.contact?.startsWith("http") ? (
                          <a href={h.contact} className="border border-accent px-2.5 py-1 font-mono text-[11px] text-accent hover:bg-accent hover:text-paper">
                            open profile ↗
                          </a>
                        ) : null}
                        {(h.status === "new" ? (["answered", "dismissed"] as const) : (["new"] as const)).map((s) => (
                          <form key={s} action={updateHandoff}>
                            <input type="hidden" name="id" value={h.id} />
                            <input type="hidden" name="status" value={s} />
                            <button className="border border-rule px-2.5 py-1 font-mono text-[11px] text-ink-muted hover:border-accent hover:text-accent">
                              {s === "answered" ? "mark answered" : s === "dismissed" ? "dismiss" : "reopen"}
                            </button>
                          </form>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="font-mono text-[12px] text-ink-faint">No questions yet.</p>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Where questions came from">
            <BarList unit="questions" rows={d.sources.map((s) => ({ key: s.source, label: s.source, value: s.n }))} />
          </Panel>
          <Panel title="How they were answered">
            <BarList unit="questions" rows={d.paths.map((p) => ({ key: p.path, label: p.path, value: p.n }))} />
          </Panel>
          <Panel title="Fit checks" note="job descriptions stay in the visitor's browser">
            <p className="font-mono text-3xl text-ink">{d.fit.checks}</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              {d.fit.strong} strong matches · {d.fit.gaps} gaps across all checks
            </p>
          </Panel>
        </div>

        <Panel title="Questions & answers" note={`latest ${d.exchanges.length} · click to read the answer`}>
          {d.exchanges.length ? (
            <ul className="divide-y divide-rule-faint">
              {d.exchanges.map((x, i) => (
                <li key={`${x.at}-${i}`}>
                  <details className="group py-2">
                    <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="font-mono text-[11px] text-ink-faint">{fmtDate(x.at)}</span>
                      <span className="font-mono text-[10px] tracking-wider text-accent uppercase">{x.source}</span>
                      <span className="font-mono text-[10px] text-ink-faint">{x.path}</span>
                      <span className="min-w-0 flex-1 text-[14px] text-ink">{x.question}</span>
                    </summary>
                    <div className="mt-2 border-l-2 border-rule pl-3">
                      <p className="max-w-prose text-[14px] leading-relaxed whitespace-pre-wrap text-ink-muted">{x.answer ?? "—"}</p>
                      <p className="mt-1.5 font-mono text-[10px] text-ink-faint">
                        {x.model ?? "deterministic"} · {(x.ms / 1000).toFixed(1)}s
                        {x.cost_usd ? ` · $${Number(x.cost_usd).toFixed(5)}` : ""}
                        {x.run_id ? (
                          <>
                            {" · "}
                            <Link href={`/r/${x.run_id}`} className="underline hover:text-accent">
                              permalink
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-[12px] text-ink-faint">No questions yet.</p>
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Misses — the content backlog" note="generic card, not on record, or quarantined">
            {d.misses.length ? (
              <ul className="space-y-1.5 text-[13px]">
                {d.misses.map((m) => (
                  <li key={m.q} className="flex gap-3">
                    <span className="w-6 shrink-0 text-right font-mono text-[12px] text-ink-faint tabular-nums">{m.count}×</span>
                    <span className="text-ink">
                      {m.q}
                      {m.absent ? <span className="ml-2 font-mono text-[11px] text-accent">not on record: {m.absent}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-[12px] text-ink-faint">No misses.</p>
            )}
            {d.flagged.length ? (
              <div className="mt-4 border-t border-rule-faint pt-3">
                <p className="mb-1.5 font-mono text-[10px] tracking-wider text-ink-faint uppercase">flagged “this missed”</p>
                <ul className="space-y-1 text-[13px]">
                  {d.flagged.map((f, i) => (
                    <li key={i} className="text-ink-muted">
                      <span className="font-mono text-[11px] text-ink-faint">{fmtDate(f.at)}</span> {f.question}
                      {f.note ? ` — ${f.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Panel>
          <Panel title="First question → reached out" note="which opening question leads to contact">
            {d.conversion.length ? (
              <table className="report-table w-full text-left text-[13px]">
                <thead>
                  <tr className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
                    <th className="py-2 font-medium">First question</th>
                    <th className="py-2 text-right font-medium">Visitors</th>
                    <th className="py-2 text-right font-medium">Reached out</th>
                  </tr>
                </thead>
                <tbody>
                  {d.conversion.map((c) => (
                    <tr key={c.q}>
                      <td className="py-1.5">{c.q}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums">{c.visitors}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums">{c.converted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="font-mono text-[12px] text-ink-faint">No data yet.</p>
            )}
          </Panel>
        </div>
      </main>
    </div>
  );
}
