import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";

import { SYSTEM_PROMPT } from "./prompt";
import { getContact } from "./tools/getContact";
import { getInternship } from "./tools/getIntership";
import { getPresentation } from "./tools/getPresentation";
import { getProjects } from "./tools/getProjects";
import { getResume } from "./tools/getResume";
import { getSkills } from "./tools/getSkills";

export const maxDuration = 30;

// Create Google AI provider with explicit API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// ❌ Pas besoin de l'export ici, Next.js n'aime pas ça
function errorHandler(error: unknown) {
  if (error == null) {
    return "Unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("[CHAT-API] Incoming messages:", messages);

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error(
        "[CHAT-API] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable"
      );
      return new Response("Missing API key", { status: 500 });
    }

    console.log(
      "[CHAT-API] API key available:",
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.slice(0, 10) + "..."
    );

    // Add system prompt
    messages.unshift(SYSTEM_PROMPT);

    // Add tools
    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getInternship,
    };

    console.log("[CHAT-API] About to call streamText");

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages,
      tools,
      maxSteps: 2,
    });

    console.log("[CHAT-API] streamText completed successfully");
    console.log("[CHAT-API] Result object keys:", Object.keys(result));

    const response = result.toDataStreamResponse();
    console.log("[CHAT-API] DataStreamResponse created");

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Handle specific error types
    if (error instanceof Error && error.message?.includes("quota")) {
      return new Response("API quota exceeded. Please try again later.", {
        status: 429,
      });
    }

    if (error instanceof Error && error.message?.includes("network")) {
      return new Response(
        "Network error. Please check your connection and try again.",
        { status: 503 }
      );
    }

    return new Response(
      `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
