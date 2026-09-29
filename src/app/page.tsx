import Link from "next/link";
import { BootCard } from "@/components/boot-card";
import { ContactLink } from "@/components/contact-link";
import { Console } from "@/components/console/console";
import { StarIndex } from "@/components/star-index";
import { ThemeToggle } from "@/components/theme-toggle";
import { personal, site } from "@/data/portfolio";

const navLink =
  "text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Chrome */}
      <header className="border-b border-rule px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-ink-muted uppercase">
            <p>
              <span className="text-accent">DIV-1</span> · rev {site.revision}
              <span className="hidden sm:inline"> · weights public · alignment honest</span>
              <span aria-hidden className="caret-blink ml-1 text-accent motion-reduce:animate-none">
                ▍
              </span>
            </p>
            <ThemeToggle />
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
              {personal.name}
            </h1>
            <p className="hidden font-mono text-[11px] text-ink-muted sm:block">
              {personal.lead}
              <span className="hidden lg:inline"> · currently {personal.currentRole}</span>
            </p>
            <p className="font-mono text-[11px] text-accent">
              <span aria-hidden>●</span> {personal.openTo}
            </p>
            <nav
              aria-label="Pages and direct links"
              className="ml-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]"
            >
              {[
                { href: "/work", label: "work" },
                { href: "/systems", label: "systems" },
                { href: "/open-source", label: "open source" },
                { href: "/cv", label: "cv" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className={navLink}>
                  {l.label}
                </Link>
              ))}
              <ContactLink href={`mailto:${personal.email}`} via="header" className={navLink}>
                email
              </ContactLink>
              <a href="https://github.com/sdivyanshu90" className={`hidden sm:inline ${navLink}`}>
                github ↗
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Stage + command bar */}
      <main className="min-h-0 flex-1">
        <Console bootCard={<BootCard />} />
      </main>

      {/* Crawlable, no-JS, screen-reader catalog of every star in the sky. */}
      <StarIndex />
    </div>
  );
}
