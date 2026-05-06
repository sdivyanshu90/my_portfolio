"use client";

import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import React from "react";
import { profileInfo } from "@/lib/config-loader";
import { MapPin, GraduationCap, Terminal, Cpu } from "lucide-react";

export interface PresentationData {
  presentation?: string;
  name?: string;
  title?: string;
  age?: number;
  location?: string;
  avatar?: string;
  fallbackAvatar?: string;
  targetRoles?: string[];
  professionalSummary?: string;
}

export function Presentation({ data }: { data?: PresentationData }) {
  const profile = {
    ...profileInfo,
    name: data?.name ?? profileInfo.name,
    title: data?.title ?? profileInfo.title,
    location: data?.location ?? profileInfo.location,
    description:
      data?.presentation ??
      data?.professionalSummary ??
      profileInfo.description,
    src: data?.avatar ?? profileInfo.src,
    fallbackSrc: data?.fallbackAvatar ?? profileInfo.fallbackSrc,
    tags: data?.targetRoles ?? profileInfo.tags,
    age:
      typeof data?.age === "number" ? `${data.age} years old` : profileInfo.age,
  };

  // Map profile handle to @-identifier
  const handle = profile.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="mx-auto w-full max-w-4xl min-w-0 py-6 px-1 sm:px-2"
    >
      {/* Model Card Shell */}
      <div className="console-surface overflow-hidden rounded-2xl">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#1a2535] bg-[#080c12] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-3.5 w-3.5 text-[#00d4aa]" />
            <span className="font-mono text-[0.65rem] font-semibold tracking-[0.2em] text-[#00d4aa] uppercase opacity-80">
              CANDIDATE_PROFILE · v1.0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="led-green" />
            <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-[#00d4aa] uppercase opacity-70">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Avatar + Identity Row */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-[200px_1fr]">
          {/* Avatar */}
          <div className="flex items-start justify-center border-b border-[#1a2535] p-6 sm:border-b-0 sm:border-r">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className="relative h-36 w-36 overflow-hidden rounded-xl border border-[#1a2535]"
            >
              <Image
                src={profile.src || profile.fallbackSrc}
                alt={profile.name}
                width={144}
                height={144}
                className="h-full w-full object-cover object-center"
              />
              {/* Teal overlay on bottom edge */}
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00d4aa] opacity-50" />
            </motion.div>
          </div>

          {/* Identity fields table */}
          <div className="divide-y divide-[#1a2535]">
            <div className="grid grid-cols-[100px_1fr]">
              <div className="bg-[#080c12]/40 flex items-center px-5 py-3 font-mono text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#00d4aa] opacity-60">
                ID
              </div>
              <div className="px-5 py-3 font-mono text-sm text-[#00d4aa]">
                {handle}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <div className="bg-[#080c12]/40 flex items-center px-5 py-3 font-mono text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#00d4aa] opacity-60">
                Name
              </div>
              <div className="px-5 py-3 text-sm font-semibold text-[#e2e8f0]">
                {profile.name}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <div className="bg-[#080c12]/40 flex items-center px-5 py-3 font-mono text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#00d4aa] opacity-60">
                Role
              </div>
              <div className="px-5 py-3 text-sm text-[#c5d5e8] leading-5">
                {profile.title}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <div className="bg-[#080c12]/40 flex items-center px-5 py-3 font-mono text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#00d4aa] opacity-60">
                Location
              </div>
              <div className="px-5 py-3 flex items-center gap-2 text-sm text-[#8b9db5]">
                <MapPin className="h-3.5 w-3.5 text-[#5c7080] shrink-0" />
                {profile.location}
              </div>
            </div>
            {profile.age && (
              <div className="grid grid-cols-[100px_1fr]">
                <div className="bg-[#080c12]/40 flex items-center px-5 py-3 font-mono text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#00d4aa] opacity-60">
                  Age
                </div>
                <div className="px-5 py-3 text-sm text-[#8b9db5]">
                  {profile.age}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio section */}
        <div className="border-t border-[#1a2535] px-5 py-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="mono-label">Summary</span>
          </div>
          <p className="text-safe-wrap text-sm leading-7 text-[#8b9db5]">
            {profile.description}
          </p>
        </div>

        {/* Target roles */}
        {profile.tags.length > 0 && (
          <div className="border-t border-[#1a2535] bg-[#080c12]/30 px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-[#00d4aa]" />
              <span className="mono-label">Target Roles</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-safe-wrap font-mono text-[0.68rem] rounded border border-[#00d4aa]/20 bg-[#001a12] px-3 py-1 text-[#00d4aa] opacity-80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Presentation;

export interface PresentationData {
  presentation?: string;
  name?: string;
  title?: string;
  age?: number;
  location?: string;
  avatar?: string;
  fallbackAvatar?: string;
  targetRoles?: string[];
  professionalSummary?: string;
}

export function Presentation({ data }: { data?: PresentationData }) {
  const profile = {
    ...profileInfo,
    name: data?.name ?? profileInfo.name,
    title: data?.title ?? profileInfo.title,
    location: data?.location ?? profileInfo.location,
    description:
      data?.presentation ??
      data?.professionalSummary ??
      profileInfo.description,
    src: data?.avatar ?? profileInfo.src,
    fallbackSrc: data?.fallbackAvatar ?? profileInfo.fallbackSrc,
    tags: data?.targetRoles ?? profileInfo.tags,
    age:
      typeof data?.age === "number" ? `${data.age} years old` : profileInfo.age,
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
      },
    },
  };

  const paragraphAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 py-6 font-sans">
      <div className="grid min-w-0 grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="h-full w-full"
            >
              <Image
                src={profile.src || profile.fallbackSrc}
                alt={profile.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-center"
              />
            </motion.div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col space-y-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <h1 className="text-safe-balance from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-xl font-semibold text-transparent md:text-3xl">
              {profile.name}
            </h1>
            <p className="text-safe-wrap mt-2 text-sm font-medium text-foreground/80 md:text-base">
              {profile.title}
            </p>
            <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
              <p className="text-muted-foreground">{profile.age}</p>
              <div className="bg-border hidden h-1.5 w-1.5 rounded-full md:block" />
              <p className="text-safe-wrap text-muted-foreground">
                {profile.location}
              </p>
            </div>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={paragraphAnimation}
            className="text-safe-wrap text-foreground leading-relaxed whitespace-pre-line"
          >
            {profile.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-2 flex flex-wrap gap-2"
          >
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="text-safe-wrap bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Presentation;
