import * as d from "@/data/portfolio";
import scorecard from "@/data/eval-scorecard.json";

export const dynamic = "force-static";

/** The whole dossier as typed JSON — what the console, pages and MCP read. */
export function GET(): Response {
  return Response.json(
    {
      schema: "div1.dossier/1",
      revision: d.site.revision,
      provenance:
        "Résumé PDF, GitHub profile/API, repository READMEs, and Divanshu's Uniiq engineering work summary. Open-source counts verified against the GitHub API.",
      person: {
        name: d.personal.name,
        lead: d.personal.lead,
        roles: d.personal.roles,
        currentRole: d.personal.currentRole,
        availability: d.personal.openTo,
        location: d.personal.location,
        email: d.personal.email,
        summary: d.personal.abstract,
        links: d.socials,
        resume: d.resume.href,
      },
      keyResults: d.keyResults,
      experience: d.changelog,
      education: d.education,
      caseStudies: d.caseStudies.map((c) => ({ ...c, url: `${d.site.url}/work/${c.id}` })),
      shipped: d.shipped,
      openSource: d.openSource,
      fromScratchIndex: d.scratchIndex.map((e) => ({ ...e, url: `https://github.com/${e.repo}` })),
      teaching: d.fieldGuides,
      capabilities: d.capabilities,
      certifications: d.certifications,
      honors: d.honors,
      github: d.github,
      routerEval: scorecard,
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
