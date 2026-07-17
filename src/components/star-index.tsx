import { caseStudies, scratchIndex } from "@/data/portfolio";

/**
 * Server-rendered, visually-hidden equivalent of the constellation: the same
 * 44 systems as real links. Guarantees the catalog is crawlable and reachable
 * with JS off or a screen reader, independent of the canvas (which is a
 * client-only, ssr:false enhancement).
 */
export function StarIndex() {
  return (
    <nav aria-label="Index of Divanshu Sharma's systems" className="sr-only">
      <h2>From-scratch systems</h2>
      <ul>
        {scratchIndex.map((e) => (
          <li key={e.repo}>
            <a href={`https://github.com/${e.repo}`}>
              {e.name} — {e.layer}, {e.lang}: {e.summary}
            </a>
          </li>
        ))}
      </ul>
      <h2>Selected case studies</h2>
      <ul>
        {caseStudies.map((c) => (
          <li key={c.id}>
            <a href={c.links[0]?.href ?? "https://github.com/sdivyanshu90"}>
              {c.title} — {c.domain}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
