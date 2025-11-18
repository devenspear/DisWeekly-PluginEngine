import { NextRequest, NextResponse } from "next/server";
import { validateAuth, createAuthErrorResponse } from "@/lib/auth";
import { URL_WRITER_SYSTEM_PROMPT } from "@/lib/prompts";

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = validateAuth(request);
  if (!authResult.valid) {
    return createAuthErrorResponse(authResult.error || "Authentication failed");
  }

  // Get current configuration
  const config = {
    systemPrompt: process.env.CUSTOM_SYSTEM_PROMPT || URL_WRITER_SYSTEM_PROMPT,
    llmProvider: process.env.LLM_PROVIDER || "anthropic",
    model: getModelName(),
    hasCustomSystemPrompt: !!process.env.CUSTOM_SYSTEM_PROMPT,
    environment: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    },
  };

  return NextResponse.json({
    status: "ok",
    config,
    note: "To persist prompt changes, update CUSTOM_SYSTEM_PROMPT environment variable in Vercel. Changes via this API are temporary (deployment session only).",
  });
}

function getModelName(): string {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  if (provider === "anthropic") {
    return "claude-3-opus-20240229";
  } else if (provider === "openai") {
    return "gpt-4-turbo-preview";
  } else if (provider === "gemini") {
    return "gemini-pro";
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = validateAuth(request);
  if (!authResult.valid) {
    return createAuthErrorResponse(authResult.error || "Authentication failed");
  }

  return NextResponse.json(
    {
      status: "error",
      message: "Prompt updates must be done via Vercel environment variables. Set CUSTOM_SYSTEM_PROMPT to override the default prompt.",
      instructions: [
        "1. Go to Vercel Dashboard: https://vercel.com/deven-projects/disweekly-backend/settings/environment-variables",
        "2. Add or update CUSTOM_SYSTEM_PROMPT variable",
        "3. Redeploy to apply changes",
      ],
    },
    { status: 400 }
  );
}
