import type { MetadataRoute } from "next";
import { caseStudies, site } from "@/data/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });
  return [
    page("", 1),
    page("/work", 0.9),
    page("/cv", 0.9),
    page("/open-source", 0.8),
    page("/systems", 0.8),
    page("/fit", 0.7),
    ...caseStudies.map((c) => page(`/work/${c.id}`, 0.7)),
    page("/llms.txt", 0.3),
  ];
}
