"use client";

import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import React from "react";
import { profileInfo } from "@/lib/config-loader";

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
