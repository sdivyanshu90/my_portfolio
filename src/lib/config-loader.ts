import rawPortfolioConfig from "../../portfolio-config.json";
import { PortfolioConfig } from "../types/portfolio";
import { portfolioConfigSchema } from "./config-schema";
import ConfigParser from "./config-parser";

const parsedConfig = portfolioConfigSchema.safeParse(rawPortfolioConfig);

if (!parsedConfig.success) {
  console.error(
    "Invalid portfolio configuration:",
    parsedConfig.error.flatten(),
  );
  throw new Error(
    "Invalid portfolio-config.json. Fix the config before starting the app.",
  );
}

const portfolioConfig: PortfolioConfig = parsedConfig.data;

// Create a parser instance
const configParser = new ConfigParser(portfolioConfig);

// Export configuration and parsed data
export const getConfig = (): PortfolioConfig => portfolioConfig;
export const getConfigParser = (): ConfigParser => configParser;

// Export pre-parsed common data for easy access
export const systemPrompt = configParser.generateSystemPrompt();
export const contactInfo = configParser.generateContactInfo();
export const profileInfo = configParser.generateProfileInfo();
export const skillsData = configParser.generateSkillsData();
export const projectData = configParser.generateProjectData();
export const presetReplies = configParser.generatePresetReplies();
export const resumeDetails = configParser.generateResumeDetails();
export const internshipInfo = configParser.generateInternshipInfo();
