"use client";

import { getConfig } from "@/lib/config-loader";
import { motion } from "framer-motion";
import { Download, ExternalLink, File } from "lucide-react";
import React from "react";

export interface ResumeCardData {
  personalInfo?: {
    targetRoles?: string[];
  };
  education?: {
    coursework?: string[];
  };
  experience?: Array<{
    company: string;
    position: string;
    duration: string;
  }>;
  resume?: {
    title?: string;
    description?: string;
    fileType?: string;
    lastUpdated?: string;
    fileSize?: string;
    downloadUrl?: string;
    certifications?: Array<{
      name: string;
      issuer: string;
      year: string;
    }>;
  };
}

export function Resume({ data }: { data?: ResumeCardData }) {
  const config = getConfig();
  const resumeDetails = {
    title: data?.resume?.title ?? config.resume.title,
    description: data?.resume?.description ?? config.resume.description,
    fileType: data?.resume?.fileType ?? config.resume.fileType,
    lastUpdated: data?.resume?.lastUpdated ?? config.resume.lastUpdated,
    fileSize: data?.resume?.fileSize ?? config.resume.fileSize,
    downloadUrl: data?.resume?.downloadUrl ?? config.resume.downloadUrl,
  };
  const certifications =
    data?.resume?.certifications ?? config.resume.certifications;
  const coursework = data?.education?.coursework ?? config.education.coursework;
  const experience = data?.experience ?? config.experience;
  const targetRoles =
    data?.personalInfo?.targetRoles ?? config.personal.targetRoles;

  const handleDownload = () => {
    window.open(resumeDetails.downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto w-full min-w-0 py-8 font-sans">
      <motion.div
        className="group relative mb-4 min-w-0 overflow-hidden rounded-xl bg-accent p-0 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="p-5">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-safe-balance text-lg font-medium text-foreground">
                {resumeDetails.title}
              </h3>
              <p className="text-safe-wrap text-sm text-muted-foreground">
                {resumeDetails.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {targetRoles.map((role) => (
                  <span
                    key={role}
                    className="text-safe-wrap rounded-full bg-background px-3 py-1 text-xs text-muted-foreground"
                  >
                    {role}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap text-xs text-muted-foreground">
                <span className="text-safe-wrap">{resumeDetails.fileType}</span>
                <span className="mx-2">•</span>
                <span className="text-safe-wrap">
                  Updated {resumeDetails.lastUpdated}
                </span>
                <span className="mx-2">•</span>
                <span className="text-safe-wrap">{resumeDetails.fileSize}</span>
              </div>
            </div>

            <motion.button
              onClick={handleDownload}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/80"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="overflow-hidden rounded-xl border bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b bg-gray-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Resume Preview
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700"
          >
            <ExternalLink className="h-3 w-3" />
            Open Full
          </button>
        </div>

        <div className="h-[600px] w-full bg-gray-50">
          <iframe
            src={resumeDetails.downloadUrl}
            width="100%"
            height="100%"
            className="border-0"
            title="Resume Preview"
          />
        </div>
      </motion.div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-background p-5">
          <h4 className="text-sm font-semibold text-foreground">
            Certifications
          </h4>
          <div className="mt-3 space-y-3">
            {certifications.map((certification) => (
              <div
                key={`${certification.name}-${certification.year}`}
                className="min-w-0"
              >
                <p className="text-safe-wrap text-sm font-medium text-foreground">
                  {certification.name}
                </p>
                <p className="text-safe-wrap text-xs text-muted-foreground">
                  {certification.issuer} • {certification.year}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <h4 className="text-sm font-semibold text-foreground">
            Resume Highlights
          </h4>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {experience.slice(0, 2).map((item) => (
              <li
                key={`${item.company}-${item.position}`}
                className="text-safe-wrap"
              >
                <span className="font-medium text-foreground">
                  {item.position}
                </span>{" "}
                at {item.company} • {item.duration}
              </li>
            ))}
            {coursework.slice(0, 3).map((course) => (
              <li key={course} className="text-safe-wrap">
                {course}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Resume;
