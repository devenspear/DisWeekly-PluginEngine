// Validation utilities for URL Writer output

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateHeadline(headline: string): {
  valid: boolean;
  wordCount: number;
  error?: string;
} {
  const cleaned = headline.replace(/\*\*/g, "").trim();
  const wordCount = countWords(cleaned);

  if (wordCount === 0) {
    return { valid: false, wordCount: 0, error: "Headline is empty" };
  }

  if (wordCount > 12) {
    return {
      valid: false,
      wordCount,
      error: `Headline has ${wordCount} words (max 12)`,
    };
  }

  return { valid: true, wordCount };
}

export function validateBullet(bullet: string): {
  valid: boolean;
  wordCount: number;
  error?: string;
} {
  const wordCount = countWords(bullet);

  if (wordCount === 0) {
    return { valid: false, wordCount: 0, error: "Bullet is empty" };
  }

  if (wordCount < 10) {
    return {
      valid: false,
      wordCount,
      error: `Bullet has ${wordCount} words (min 10)`,
    };
  }

  if (wordCount > 16) {
    return {
      valid: false,
      wordCount,
      error: `Bullet has ${wordCount} words (max 16)`,
    };
  }

  return { valid: true, wordCount };
}

export function validateOutput(output: {
  headlinePrimary: string;
  headlineSecondary: string;
  bullets: string[];
}): {
  valid: boolean;
  errors: string[];
  headlinesWordCounts: number[];
  bulletsWordCounts: number[];
} {
  const errors: string[] = [];
  const headlinesWordCounts: number[] = [];
  const bulletsWordCounts: number[] = [];

  // Validate headlines
  const h1 = validateHeadline(output.headlinePrimary);
  headlinesWordCounts.push(h1.wordCount);
  if (!h1.valid) errors.push(`Primary headline: ${h1.error}`);

  const h2 = validateHeadline(output.headlineSecondary);
  headlinesWordCounts.push(h2.wordCount);
  if (!h2.valid) errors.push(`Secondary headline: ${h2.error}`);

  // Validate bullets count
  if (output.bullets.length !== 6) {
    errors.push(`Expected 6 bullets, got ${output.bullets.length}`);
  }

  // Validate each bullet
  output.bullets.forEach((bullet, idx) => {
    const result = validateBullet(bullet);
    bulletsWordCounts.push(result.wordCount);
    if (!result.valid) {
      errors.push(`Bullet ${idx + 1}: ${result.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    headlinesWordCounts,
    bulletsWordCounts,
  };
}

export function validateArticleContent(content: {
  url: string;
  body: string;
  estimatedWordCount: number;
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // URL validation
  try {
    new URL(content.url);
  } catch {
    errors.push("Invalid URL format");
  }

  // Word count check
  if (content.estimatedWordCount < 400) {
    errors.push(
      `Article too short: ${content.estimatedWordCount} words (min 400)`
    );
  }

  // Body content check
  if (!content.body || content.body.trim().length < 100) {
    errors.push("Article body is too short or empty");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
