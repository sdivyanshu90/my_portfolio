import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocShell } from "@/components/doc/doc-shell";
import { type Block, posts } from "@/data/writing";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.dek,
    alternates: { canonical: `/writing/${p.slug}` },
    robots: p.published ? undefined : { index: false, follow: false },
  };
}

/** Inline URLs become links; everything else is plain text. */
function Text({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s),]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} className="text-accent underline underline-offset-2">
            {part.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Render({ b }: { b: Block }) {
  if (b.t === "h2") return <h2 className="mt-8 text-xl font-medium tracking-tight">{b.text}</h2>;
  if (b.t === "ul")
    return (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-ink-muted marker:text-accent">
        {b.items.map((i) => (
          <li key={i}>
            <Text text={i} />
          </li>
        ))}
      </ul>
    );
  if (b.t === "quote")
    return <blockquote className="mt-8 border-l-2 border-accent pl-4 text-lg text-ink italic">{b.text}</blockquote>;
  return (
    <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
      <Text text={b.text} />
    </p>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p || (!p.published && !(await isAdmin()))) notFound();
  return (
    <DocShell
      current="/writing"
      eyebrow={
        <>
          Writing · {p.date}
          {!p.published ? <span className="ml-2">· DRAFT — only you can see this; set published: true in src/data/writing.ts</span> : null}
        </>
      }
      title={p.title}
      lede={<p>{p.dek}</p>}
    >
      <article className="max-w-prose">
        {p.body.map((b, i) => (
          <Render key={i} b={b} />
        ))}
      </article>
    </DocShell>
  );
}
