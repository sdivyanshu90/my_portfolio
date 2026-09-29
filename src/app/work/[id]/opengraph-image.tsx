import { caseStudies } from "@/data/portfolio";
import { OG_SIZE, posterImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study figure";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ id: c.id }));
}

/** The headline metric *is* the share image: "0.00% CER", "88.08%". */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = caseStudies.find((x) => x.id === id)!;
  const metric = c.results[0].metric;
  const figure = metric.match(/^[^\s]+(?:\s*→\s*[^\s]+)?/)?.[0] ?? metric;
  return posterImage({
    head: `Fig. ${c.fig} · ${c.domain}`,
    figure,
    title: c.title,
    sub: `${metric} — ${c.results[0].detail}`.slice(0, 110),
  });
}
