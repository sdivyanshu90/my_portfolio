import {
  capabilities,
  caseStudies,
  changelog,
  counts,
  education,
  openSource,
  personal,
  resume,
  site,
  socials,
} from "@/data/portfolio";

export const dynamic = "force-static";

/**
 * llms.txt — the portfolio for language models: a plain-markdown brief an
 * AI screener can read in one fetch, pointing at the typed data and MCP.
 */
export function GET(): Response {
  const lines = [
    `# ${personal.name}`,
    "",
    `> ${personal.lead}. ${personal.currentRole}. ${personal.openTo}. Based in ${personal.location}.`,
    "",
    personal.abstract.join("\n\n"),
    "",
    "Facts on this site come from his résumé, GitHub, repository READMEs and a Uniiq work summary; open-source counts are verified against the GitHub API. Nothing is inferred.",
    "",
    "## Contact",
    `- Email: ${personal.email}`,
    `- Résumé (PDF): ${resume.href}`,
    `- CV (HTML): ${site.url}/cv`,
    ...socials.map((s) => `- ${s.label}: ${s.href}`),
    "",
    "## Experience",
    ...changelog.map((r) => `- ${r.role}, ${r.org} (${r.span}): ${r.summary}`),
    "",
    "## Selected work",
    ...caseStudies.map(
      (c) => `- [${c.title}](${site.url}/work/${c.id}): ${c.results[0].metric} — ${c.results[0].detail}. Stack: ${c.stack.join(", ")}.`,
    ),
    "",
    "## Open source (merged upstream PRs)",
    ...openSource
      .filter((o) => o.role !== "Author")
      .map((o) => `- [${o.name}](${o.href}): ${o.role === "Contributor" ? `${o.merged} merged` : "proposal, unmerged"} — ${o.summary}`),
    "",
    "## Skills",
    ...capabilities.map((c) => `- ${c.area}: ${c.items}`),
    "",
    "## Education",
    `- ${education.degree}, ${education.school}, ${education.grade} (${education.span})`,
    "",
    "## Machine-readable",
    `- [dossier.json](${site.url}/dossier.json): the full typed dossier`,
    `- [MCP server](${site.url}/api/mcp): streamable HTTP; tools search_dossier, get_case_study, list_systems, match_requirements (paste a job description), get_contact`,
    `- [From-scratch index](${site.url}/systems): ${counts.systems} AI-stack reimplementations`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
