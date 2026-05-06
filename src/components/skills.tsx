"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfig } from "@/lib/config-loader";
import { motion, easeOut } from "framer-motion";
import { Brain, Cloud, Code, Cpu, Database, Users } from "lucide-react";

export interface SkillsCardData {
  technicalSkills?: {
    programming?: string[];
    machineLearning?: string[];
    webDevelopment?: string[];
    databases?: string[];
    devOpsCloud?: string[];
    softSkills?: string[];
  };
}

const Skills = ({ data }: { data?: SkillsCardData }) => {
  const config = getConfig();
  const technicalSkills = data?.technicalSkills;

  const skillsData = [
    {
      category: "Programming Languages",
      icon: <Code className="h-5 w-5" />,
      skills: technicalSkills?.programming ?? config.skills.programming,
      color: "border border-blue-200 bg-blue-50 text-blue-600",
    },
    {
      category: "ML/AI Technologies",
      icon: <Brain className="h-5 w-5" />,
      skills: technicalSkills?.machineLearning ?? config.skills.ml_ai,
      color: "border border-purple-200 bg-purple-50 text-purple-600",
    },
    {
      category: "Web Development",
      icon: <Cpu className="h-5 w-5" />,
      skills: technicalSkills?.webDevelopment ?? config.skills.web_development,
      color: "border border-green-200 bg-green-50 text-green-600",
    },
    {
      category: "Databases",
      icon: <Database className="h-5 w-5" />,
      skills: technicalSkills?.databases ?? config.skills.databases,
      color: "border border-orange-200 bg-orange-50 text-orange-600",
    },
    {
      category: "DevOps & Cloud",
      icon: <Cloud className="h-5 w-5" />,
      skills: technicalSkills?.devOpsCloud ?? config.skills.devops_cloud,
      color: "border border-emerald-200 bg-emerald-50 text-emerald-600",
    },
    {
      category: "Soft Skills",
      icon: <Users className="h-5 w-5" />,
      skills: technicalSkills?.softSkills ?? config.skills.soft_skills,
      color: "border border-amber-200 bg-amber-50 text-amber-600",
    },
  ].filter((category) => category.skills.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
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

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className="mx-auto w-full max-w-5xl rounded-4xl px-4 sm:px-6"
    >
      <Card className="w-full border-none px-0 pb-8 shadow-none sm:pb-12">
        <CardHeader className="px-0 pb-1">
          <CardTitle className="text-primary text-safe-balance px-0 text-2xl font-bold sm:text-3xl lg:text-4xl">
            Skills & Expertise
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <motion.div
            className="space-y-6 px-0 sm:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {skillsData.map((section) => (
              <motion.div
                key={section.category}
                className="space-y-3 px-0"
                variants={itemVariants}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {section.icon}
                  <h3 className="text-accent-foreground text-safe-wrap text-base font-semibold sm:text-lg">
                    {section.category}
                  </h3>
                </div>

                <motion.div
                  className="flex flex-wrap gap-1.5 sm:gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {section.skills.map((skill) => (
                    <motion.div
                      key={skill}
                      variants={badgeVariants}
                      whileHover={{
                        scale: 1.04,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Badge
                        className={`${section.color} text-safe-wrap max-w-full whitespace-normal px-2 py-1 text-center text-xs font-normal sm:px-3 sm:py-1.5 sm:text-sm`}
                      >
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Skills;
