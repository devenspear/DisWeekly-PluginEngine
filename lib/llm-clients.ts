import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { LLMResponse } from "@/types";
import { URL_WRITER_SYSTEM_PROMPT, buildUserPrompt, parseWebResponse } from "./prompts";

// Anthropic Client
export async function processWithAnthropic(article: {
  url: string;
  title: string;
  body: string;
  override?: boolean;
}): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 2048,
    system: URL_WRITER_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(article, article.override),
      },
    ],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  console.log("Claude Opus response:", responseText);

  const parsed = parseWebResponse(responseText);
  if (!parsed) {
    console.error("Failed to parse response. Raw response:", responseText);
    throw new Error(`Failed to parse Anthropic response. First 500 chars: ${responseText.substring(0, 500)}`);
  }

  return {
    headlinePrimary: parsed.headlinePrimary,
    headlineSecondary: parsed.headlineSecondary,
    bullets: parsed.bullets,
  };
}

// OpenAI Client
export async function processWithOpenAI(article: {
  url: string;
  title: string;
  body: string;
}): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: URL_WRITER_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildUserPrompt(article),
      },
    ],
    temperature: 0.3,
    max_tokens: 2048,
  });

  const responseText = completion.choices[0]?.message?.content || "";

  const parsed = parseWebResponse(responseText);
  if (!parsed) {
    throw new Error("Failed to parse OpenAI response");
  }

  return {
    headlinePrimary: parsed.headlinePrimary,
    headlineSecondary: parsed.headlineSecondary,
    bullets: parsed.bullets,
  };
}

// Gemini Client (using REST API)
export async function processWithGemini(article: {
  url: string;
  title: string;
  body: string;
}): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${URL_WRITER_SYSTEM_PROMPT}\n\n${buildUserPrompt(article)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const parsed = parseWebResponse(responseText);
  if (!parsed) {
    throw new Error("Failed to parse Gemini response");
  }

  return {
    headlinePrimary: parsed.headlinePrimary,
    headlineSecondary: parsed.headlineSecondary,
    bullets: parsed.bullets,
  };
}

// Main processor - auto-selects based on available API keys
export async function processArticle(article: {
  url: string;
  title: string;
  body: string;
  override?: boolean;
}): Promise<LLMResponse> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  switch (provider) {
    case "anthropic":
      return processWithAnthropic(article);
    case "openai":
      return processWithOpenAI(article);
    case "gemini":
      return processWithGemini(article);
    default:
      // Fallback: try providers in order
      if (process.env.ANTHROPIC_API_KEY) {
        return processWithAnthropic(article);
      }
      if (process.env.OPENAI_API_KEY) {
        return processWithOpenAI(article);
      }
      if (process.env.GEMINI_API_KEY) {
        return processWithGemini(article);
      }
      throw new Error("No LLM API key configured");
  }
}
