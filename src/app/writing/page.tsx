import type { Metadata } from "next";
import Link from "next/link";
import { DocShell } from "@/components/doc/doc-shell";
import { posts } from "@/data/writing";
import { isAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical write-ups on LLM systems, evaluation and open source.",
  alternates: { canonical: "/writing" },
};
export const dynamic = "force-dynamic";

export default async function Writing() {
  const admin = await isAdmin();
  const visible = posts.filter((p) => p.published || admin);
  return (
    <DocShell current="/writing" eyebrow="Writing" title="Notes from the work" lede="Short technical write-ups — how things were built, and what they taught.">
      {visible.length ? (
        <ul className="divide-y divide-rule-faint border-y border-rule-faint">
          {visible.map((p) => (
            <li key={p.slug} className="py-5">
              <Link href={`/writing/${p.slug}`} className="group block">
                <p className="font-mono text-[11px] text-ink-faint">
                  {p.date} · {p.tags.join(" · ")}
                  {!p.published ? <span className="ml-2 text-accent">DRAFT — only you can see this</span> : null}
                </p>
                <p className="mt-1 text-xl font-medium tracking-tight group-hover:text-accent">{p.title}</p>
                <p className="mt-1 text-[15px] text-ink-muted">{p.dek}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-[12px] text-ink-faint">First posts coming soon.</p>
      )}
    </DocShell>
  );
}
