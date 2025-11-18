// Request from Chrome Extension
export type CaptureRequest = {
  url: string;
  title: string;
  sourceDomain: string;
  body: string;
  client: "chrome-extension";
  meta: {
    userAgent: string;
    capturedAt: string;
    estimatedWordCount: number;
  };
};

// URL Writer Output
export type UrlWriterOutput = {
  status: "ok" | "reject" | "error";
  articleId?: string;
  output?: {
    headlinePrimary: string;
    headlineSecondary: string;
    bullets: string[];
    url: string;
  };
  validation?: {
    wordCount: number;
    bulletsCount: number;
    headlinesWordCounts: number[];
    bulletsWordCounts: number[];
    sourcePurityChecksPassed: boolean;
  };
  reason?: string;
  details?: string;
};

// LLM Provider types
export type LLMProvider = "anthropic" | "openai" | "gemini";

export type LLMResponse = {
  headlinePrimary: string;
  headlineSecondary: string;
  bullets: string[];
};

// Database article record (optional)
export type ArticleRecord = {
  id: string;
  url: string;
  title: string;
  sourceDomain: string;
  processedAt: string;
  output: {
    headlinePrimary: string;
    headlineSecondary: string;
    bullets: string[];
  };
  validation: {
    wordCount: number;
    bulletsCount: number;
    headlinesWordCounts: number[];
    bulletsWordCounts: number[];
    sourcePurityChecksPassed: boolean;
  };
};
