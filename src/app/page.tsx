import { BootCard } from "@/components/boot-card";
import { Console } from "@/components/console/console";
import { StarIndex } from "@/components/star-index";
import { ThemeToggle } from "@/components/theme-toggle";
import { personal, resume, site } from "@/data/portfolio";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Chrome */}
      <header className="border-b border-rule px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-ink-muted uppercase">
            <p>
              <span className="text-accent">DIV-1</span> · rev {site.revision} ·
              weights public · alignment honest
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
            <p className="font-mono text-[11px] text-ink-muted">
              {personal.lead}
              <span className="hidden lg:inline"> · currently {personal.currentRole}</span>
            </p>
            <p className="font-mono text-[11px] text-accent">
              <span aria-hidden>●</span> {personal.openTo}
            </p>
            <nav
              aria-label="Direct links"
              className="ml-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]"
            >
              <a
                href={`mailto:${personal.email}`}
                className="text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                email
              </a>
              <a
                href="https://github.com/sdivyanshu90"
                className="text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                github ↗
              </a>
              <a
                href="https://www.linkedin.com/in/divsha22/"
                className="text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                linkedin ↗
              </a>
              <a
                href={resume.href}
                className="text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                résumé ↓
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Stage + command bar */}
      <main className="min-h-0 flex-1">
        <Console bootCard={<BootCard />} />
      </main>

      {/* Crawlable, no-JS, screen-reader catalog of every system (37 links). */}
      <StarIndex />
    </div>
  );
}
