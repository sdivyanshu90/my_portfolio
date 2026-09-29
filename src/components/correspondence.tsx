import { CiteCard } from "@/components/cite-card";
import { ContactLink } from "@/components/contact-link";
import { personal, resume, socials } from "@/data/portfolio";

/** Contact section: plain rows on the left, citation card on the right. */
export function Correspondence() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="min-w-0">
        <p className="max-w-prose text-[15px] leading-relaxed text-ink-muted">
          {personal.openTo}. The fastest route is email; the most complete
          record is GitHub. Replies typically within a day.
        </p>
        <dl className="mt-6 divide-y divide-rule-faint border-y border-rule-faint">
          <div className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px]">
            <dt className="font-mono text-[11px] leading-6 tracking-[0.15em] text-ink-faint uppercase">
              Email
            </dt>
            <dd>
              <ContactLink
                href={`mailto:${personal.email}`}
                via="contact-card"
                className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {personal.email}
              </ContactLink>
            </dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px]">
            <dt className="font-mono text-[11px] leading-6 tracking-[0.15em] text-ink-faint uppercase">
              Location
            </dt>
            <dd className="text-ink-muted">{personal.location}</dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px]">
            <dt className="font-mono text-[11px] leading-6 tracking-[0.15em] text-ink-faint uppercase">
              Résumé
            </dt>
            <dd>
              <ContactLink
                href={resume.href}
                via="contact-card"
                className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {resume.label}
              </ContactLink>
            </dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px]">
            <dt className="font-mono text-[11px] leading-6 tracking-[0.15em] text-ink-faint uppercase">
              Elsewhere
            </dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {s.label} ↗
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      <CiteCard />
    </div>
  );
}
