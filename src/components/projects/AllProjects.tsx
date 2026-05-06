"use client";
import { Card, Carousel } from "@/components/projects/apple-cards-carousel";
import { createProjectData } from "@/components/projects/ConfigData";
import type { Project } from "@/types/portfolio";

interface AllProjectsProps {
  projects?: Project[];
}

export default function AllProjects({ projects }: AllProjectsProps) {
  const cards = createProjectData(projects).map((card, index) => (
    <Card key={card.title} card={card} index={index} layout={true} />
  ));

  return (
    <div className="w-full min-w-0 pt-6 sm:pt-8">
      <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-3 px-1 sm:px-2">
        <p className="section-kicker">Selected Work</p>
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl min-w-0 space-y-2">
            <h2 className="font-display text-safe-balance text-3xl font-semibold tracking-tight text-[#102133] sm:text-4xl">
              Systems, ML products, and open-source work with measurable
              outcomes.
            </h2>
            <p className="text-safe-wrap max-w-2xl text-sm leading-7 text-[#556173] sm:text-base">
              Every card opens into a structured case study with the build
              story, impact, stack, and links. The cover art is generated from
              the project metadata instead of unrelated placeholder images.
            </p>
          </div>
          <div className="text-safe-wrap rounded-full border border-[#d8e1e9] bg-white/75 px-4 py-2 text-sm text-[#556173] shadow-sm">
            Tap a card for the full breakdown
          </div>
        </div>
      </div>

      <Carousel items={cards} />
    </div>
  );
}
