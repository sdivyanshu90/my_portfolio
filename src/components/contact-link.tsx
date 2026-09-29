"use client";

import { beacon } from "@/lib/beacon";

/**
 * A link that records a conversion when clicked — email ("contact") or the
 * résumé PDF ("resume") — so the misses inbox can show which first
 * questions lead visitors to reach out.
 */
export function ContactLink({
  href,
  via,
  className,
  children,
}: {
  href: string;
  via: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => beacon(href.startsWith("mailto:") ? "contact" : "resume", { via })}
    >
      {children}
    </a>
  );
}
