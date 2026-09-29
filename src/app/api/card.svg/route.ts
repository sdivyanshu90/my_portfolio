import { counts, personal, site } from "@/data/portfolio";
import scorecard from "@/data/eval-scorecard.json";

/**
 * A live README card: an ink-style SVG for his GitHub profile README, always
 * current with the dossier. ?theme=dark for dark READMEs.
 *   [![DIV-1](https://div90.vercel.app/api/card.svg)](https://div90.vercel.app)
 */
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function card(dark: boolean): string {
  const c = dark
    ? { bg: "#14161a", ink: "#e8e4da", muted: "#a8a296", faint: "#8d887d", accent: "#ed7455", rule: "#2b2e35" }
    : { bg: "#faf7f0", ink: "#1c1a17", muted: "#57534a", faint: "#6e685d", accent: "#a82f1b", rule: "#ddd5c6" };
  const stats: [string, string][] = [
    [`${counts.mergedUpstream}`, "merged upstream PRs"],
    [`${counts.authoredUpstream}`, "PRs to other projects"],
    [`${counts.reportedFixed}`, "bugs he found, fixed upstream"],
    [`${counts.systems}`, "from-scratch AI systems"],
    [`${scorecard.router.passed}/${scorecard.router.total}`, "router eval (golden set)"],
  ];
  const serif = "Georgia, 'Iowan Old Style', serif";
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="515" height="190" viewBox="0 0 515 190" role="img" aria-label="${esc(personal.name)} — DIV-1">
  <rect x="0.5" y="0.5" width="514" height="189" rx="4" fill="${c.bg}" stroke="${c.rule}"/>
  <rect x="18" y="0" width="3" height="190" fill="${c.accent}"/>
  <text x="36" y="30" font-family="${mono}" font-size="10" letter-spacing="2" fill="${c.accent}">DIV-1 · ${esc(site.url.replace("https://", ""))}</text>
  <text x="36" y="58" font-family="${serif}" font-size="24" fill="${c.ink}">${esc(personal.name)}</text>
  <text x="36" y="78" font-family="${mono}" font-size="11" fill="${c.muted}">${esc(personal.currentRole)}</text>
  <text x="36" y="96" font-family="${mono}" font-size="11" fill="${c.accent}">● ${esc(personal.openTo)}</text>
  <line x1="36" y1="108" x2="497" y2="108" stroke="${c.rule}"/>
  ${stats
    .map(
      ([n, label], i) =>
        `<text x="${36 + (i % 2) * 240}" y="${130 + Math.floor(i / 2) * 22}" font-family="${mono}" font-size="11" fill="${c.faint}"><tspan fill="${c.ink}" font-weight="600">${esc(n)}</tspan> ${esc(label)}</text>`,
    )
    .join("\n  ")}
</svg>`;
}

export function GET(req: Request): Response {
  const dark = new URL(req.url).searchParams.get("theme") === "dark";
  return new Response(card(dark), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
