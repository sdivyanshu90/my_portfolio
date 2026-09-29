import Link from "next/link";
import { ContactLink } from "@/components/contact-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { personal, resume, socials } from "@/data/portfolio";

/**
 * The document door: plain, fast, server-rendered pages over the same
 * dossier the console reads. Every page ends with questions that open the
 * console mid-answer, so the two doors lead into each other.
 */

const NAV = [
  { href: "/", label: "console" },
  { href: "/work", label: "work" },
  { href: "/systems", label: "systems" },
  { href: "/open-source", label: "open source" },
  { href: "/cv", label: "cv" },
  { href: "/fit", label: "fit check" },
];

const link =
  "underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

export function DocShell({
  current,
  eyebrow,
  title,
  lede,
  ask,
  children,
  wide,
}: {
  current: string;
  eyebrow?: React.ReactNode;
  title: string;
  lede?: React.ReactNode;
  /** Questions that open the console mid-answer. */
  ask?: string[];
  children: React.ReactNode;
  wide?: boolean;
}) {
  const width = wide ? "max-w-5xl" : "max-w-4xl";
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-rule px-4 py-3 sm:px-6 print:hidden">
        <div className={`mx-auto flex ${width} flex-wrap items-center gap-x-6 gap-y-2`}>
          <Link href="/" className="font-mono text-[10px] tracking-[0.18em] text-ink-muted uppercase">
            <span className="text-accent">DIV-1</span> · {personal.name}
          </Link>
          <nav aria-label="Pages" className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] sm:ml-auto">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={current === n.href ? "page" : undefined}
                className={
                  current === n.href
                    ? "text-accent underline decoration-accent underline-offset-4"
                    : `text-ink-muted ${link}`
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className={`mx-auto w-full ${width} flex-1 px-4 py-10 sm:px-6 sm:py-14`}>
        {eyebrow ? (
          <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">{title}</h1>
        {lede ? <div className="mt-4 max-w-prose text-[16px] leading-relaxed text-ink-muted">{lede}</div> : null}
        <div className="mt-10">{children}</div>

        {ask?.length ? (
          <aside aria-label="Ask the console" className="mt-14 border-t border-rule pt-6 print:hidden">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Ask DIV-1</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ask.map((q) => (
                <li key={q}>
                  <Link
                    href={`/?q=${encodeURIComponent(q)}`}
                    className="inline-block border border-rule px-3 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    › {q}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </main>

      <footer className="border-t border-rule px-4 py-5 sm:px-6 print:hidden">
        <div
          className={`mx-auto flex ${width} flex-wrap items-baseline gap-x-5 gap-y-2 font-mono text-[11px] text-ink-faint`}
        >
          <span className="text-accent">● {personal.openTo}</span>
          <ContactLink href={`mailto:${personal.email}`} via="page-footer" className={link}>
            {personal.email}
          </ContactLink>
          {socials.slice(0, 2).map((s) => (
            <a key={s.href} href={s.href} className={link}>
              {s.label.toLowerCase()} ↗
            </a>
          ))}
          <ContactLink href={resume.href} via="page-footer" className={link}>
            résumé pdf ↓
          </ContactLink>
          <span className="sm:ml-auto">© 2026 {personal.name}</span>
        </div>
      </footer>
    </div>
  );
}

/** Section heading used across document pages. */
export function DocSection({
  id,
  title,
  children,
  note,
}: {
  id: string;
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-14 first:mt-0">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule pb-2">
        <h2 id={`${id}-h`} className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          {title}
        </h2>
        {note ? <p className="font-mono text-[11px] text-ink-faint">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
