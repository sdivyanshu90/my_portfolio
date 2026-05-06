"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { profileInfo } from "@/lib/config-loader";
import { MapPin, Cpu, Sparkles } from "lucide-react";

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
    age: data?.age != null ? `${data.age} years old` : profileInfo.age,
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="mx-auto w-full max-w-4xl min-w-0 py-6 px-1 sm:px-2"
    >
      {/* Profile card */}
      <motion.div
        variants={item}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Gradient banner */}
        <div
          className="h-24 w-full"
          style={{
            background:
              "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ecfdf5 100%)",
          }}
        />

        {/* Avatar + identity */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <motion.div
            variants={item}
            className="relative -mt-12 mb-4 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-md"
            style={{ boxShadow: "0 4px 20px rgba(79,70,229,0.15), 0 0 0 4px white" }}
          >
            <Image
              src={profile.src || profile.fallbackSrc}
              alt={profile.name}
              width={96}
              height={96}
              className="h-full w-full object-cover object-center"
            />
          </motion.div>

          {/* Name + title */}
          <motion.div variants={item}>
            <h2 className="font-display text-safe-balance text-2xl font-bold text-slate-900 sm:text-3xl">
              <span className="gradient-text">{profile.name}</span>
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{profile.title}</p>
          </motion.div>

          {/* Meta row */}
          <motion.div
            variants={item}
            className="mt-3 flex flex-wrap items-center gap-3"
          >
            {profile.age && (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                {profile.age}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <MapPin className="h-3 w-3 text-indigo-500" />
              {profile.location}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="led-green" style={{ width: 6, height: 6 }} />
              Available
            </span>
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={item}
            className="text-safe-wrap mt-5 text-sm leading-7 text-slate-600 max-w-2xl"
          >
            {profile.description}
          </motion.p>

          {/* Target roles */}
          {profile.tags.length > 0 && (
            <motion.div variants={item} className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                <span className="mono-label">Target Roles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-safe-wrap rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Presentation;
