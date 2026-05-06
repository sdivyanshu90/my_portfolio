"use client";

import { getConfig } from "@/lib/config-loader";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarDays, Code2, Globe } from "lucide-react";

export interface AvailabilityData {
  availability?: string;
  preferences?: {
    roleTypes?: string[];
    workMode?: string;
    location?: string;
    startDate?: string;
    duration?: string;
  };
  skills?: {
    technical?: string[];
    soft?: string[];
  };
  achievements?: string[];
  lookingFor?: {
    goals?: string;
    workStyle?: string;
    motivation?: string;
    interests?: string[];
    growthOpportunities?: string;
    technicalChallenges?: string;
    impactfulWork?: string;
    collaboration?: string;
  };
  contact?: {
    email?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

interface AvailabilityCardProps {
  data?: AvailabilityData;
}

const AvailabilityCard = ({ data }: AvailabilityCardProps) => {
  const router = useRouter();
  const config = getConfig();
  const technicalSkills = data?.skills?.technical ?? [
    ...config.skills.programming,
    ...config.skills.ml_ai,
    ...config.skills.web_development,
  ];
  const achievements = data?.achievements ?? config.education.achievements;
  const roleTypes =
    data?.preferences?.roleTypes ?? config.internship.focusAreas;
  const duration = data?.preferences?.duration ?? config.internship.duration;
  const location = data?.preferences?.location ?? config.personal.location;
  const workMode =
    data?.preferences?.workMode ?? config.internship.preferredLocation;
  const lookingFor = data?.lookingFor;

  const handleContactClick = () => {
    router.push("/?query=How can I reach you?");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-accent mx-auto mt-8 w-full max-w-4xl min-w-0 rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12"
    >
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="bg-muted h-16 w-16 overflow-hidden rounded-full shadow-md">
            <Image
              src="/profile.jpg"
              alt="Divanshu Sharma avatar"
              width={64}
              height={64}
              className="h-full w-full object-cover object-[center_top_-5%] scale-95"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-safe-balance text-foreground text-2xl font-semibold">
              Divanshu Sharma
            </h2>
            <p className="text-safe-wrap text-muted-foreground text-sm">
              Available for Opportunities
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-0 sm:items-end">
          <span className="flex items-center gap-1 rounded-full border border-green-500 px-3 py-0.5 text-sm font-medium text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Available Now
          </span>
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            Open to full-time & internship roles
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Current Availability Status
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Status</p>
            <p className="text-safe-wrap text-sm font-semibold text-green-600 dark:text-green-400">
              {data?.availability ?? config.internship.availability}
            </p>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">
              Looking for
            </p>
            <p className="text-safe-wrap text-sm font-semibold text-blue-600 dark:text-blue-400">
              {roleTypes.slice(0, 3).join(", ")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-1 h-5 w-5 text-blue-500" />
          <div>
            <p className="text-foreground text-sm font-medium">Duration</p>
            <p className="text-safe-wrap text-muted-foreground text-sm">
              {duration}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="mt-1 h-5 w-5 text-green-500" />
          <div>
            <p className="text-foreground text-sm font-medium">Location</p>
            <p className="text-safe-wrap text-muted-foreground text-sm">
              {location} • {workMode}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:col-span-2">
          <Code2 className="mt-1 h-5 w-5 text-purple-500" />
          <div className="w-full">
            <p className="text-foreground text-sm font-medium">Tech stack</p>
            <div className="text-muted-foreground grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-2">
              <ul className="list-disc pl-4">
                {technicalSkills.slice(0, 4).map((skill) => (
                  <li key={skill} className="text-safe-wrap">
                    {skill}
                  </li>
                ))}
              </ul>
              <ul className="list-disc pl-4">
                {technicalSkills.slice(4, 8).map((skill) => (
                  <li key={skill} className="text-safe-wrap">
                    {skill}
                  </li>
                ))}
                <li>
                  <Link
                    href="/?query=What%20are%20your%20skills%3F%20Give%20me%20a%20list%20of%20your%20soft%20and%20hard%20skills."
                    className="cursor-pointer items-center text-blue-500 underline"
                  >
                    See more
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <p className="mb-2 text-lg font-semibold text-foreground">
          What I bring
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {achievements.slice(0, 3).map((achievement) => (
            <li key={achievement} className="text-safe-wrap">
              {achievement}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-lg font-semibold text-foreground">Goal</p>
        <p className="text-safe-wrap text-sm text-foreground">
          {lookingFor?.growthOpportunities ||
            "Looking for roles that offer strong ownership, learning velocity, and long-term growth."}{" "}
          I want to work on{" "}
          {lookingFor?.technicalChallenges ||
            "difficult ML and engineering problems"}{" "}
          that{" "}
          {lookingFor?.impactfulWork ||
            "solve real user problems and have measurable impact"}
          . I&apos;m ready to contribute in{" "}
          {lookingFor?.collaboration ||
            "collaborative, high-feedback environments"}
          !
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={handleContactClick}
          className="cursor-pointer rounded-full bg-black px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-zinc-800"
        >
          Contact me
        </button>
      </div>
    </motion.div>
  );
};

export default AvailabilityCard;
