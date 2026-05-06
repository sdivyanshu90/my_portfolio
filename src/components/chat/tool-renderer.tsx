// src/components/chat/tool-renderer.tsx
import type { Project } from "@/types/portfolio";
import type { AvailabilityData } from "../AvailabilityCard";
import type { ContactCardData } from "../contact";
import type { PresentationData } from "../presentation";
import type { ResumeCardData } from "../resume";
import type { SkillsCardData } from "../skills";
import { Contact } from "../contact";
import AvailabilityCard from "../AvailabilityCard";
import { Presentation } from "../presentation";
import AllProjects from "../projects/AllProjects";
import Resume from "../resume";
import Skills from "../skills";

type CompletedToolInvocation = {
  toolCallId: string;
  toolName: string;
  result: unknown;
};

interface ToolRendererProps {
  toolInvocations: CompletedToolInvocation[];
}

export default function ToolRenderer({ toolInvocations }: ToolRendererProps) {
  return (
    <div className="w-full transition-all duration-300">
      {toolInvocations.map((tool) => {
        const { toolCallId, toolName } = tool;

        // Return specialized components based on tool name
        switch (toolName) {
          case "getProjects":
            return (
              <div
                key={toolCallId}
                className="w-full overflow-hidden rounded-lg"
              >
                <AllProjects
                  projects={
                    typeof tool.result === "object" &&
                    tool.result !== null &&
                    "projects" in tool.result &&
                    Array.isArray(tool.result.projects)
                      ? (tool.result.projects as Project[])
                      : undefined
                  }
                />
              </div>
            );

          case "getPresentation":
            return (
              <div
                key={toolCallId}
                className="w-full overflow-hidden rounded-lg"
              >
                <Presentation data={tool.result as PresentationData} />
              </div>
            );

          case "getResume":
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Resume data={tool.result as ResumeCardData} />
              </div>
            );

          case "getContact":
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Contact data={tool.result as ContactCardData} />
              </div>
            );

          case "getSkills":
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Skills data={tool.result as SkillsCardData} />
              </div>
            );

          case "getInternship":
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <AvailabilityCard data={tool.result as AvailabilityData} />
              </div>
            );

          // Default renderer for other tools
          default:
            return (
              <div
                key={toolCallId}
                className="bg-secondary/10 w-full rounded-lg p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium">{toolName}</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-200">
                    Tool Result
                  </span>
                </div>
                <div className="mt-2">
                  {typeof tool.result === "object" ? (
                    <pre className="bg-secondary/20 overflow-x-auto rounded p-3 text-sm">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(tool.result)}</p>
                  )}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}
