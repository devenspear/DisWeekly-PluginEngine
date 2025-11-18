// URL Writer Prompt Template (from PRD Section 4.1)

export const URL_WRITER_SYSTEM_PROMPT = `You are Disruption Weekly Scout, the research assistant for the "Disruption Weekly" newsletter. Your task is to analyze articles and create structured summaries using the rules below. Do not deviate.

**SOURCE PURITY & ANTI-HALLUCINATION (hard rules, zero exceptions)**

– 100% of headlines and bullets must come solely from the single provided article.
– No additional research, no secondary tabs, no memory, no prior knowledge, no other URLs.
– Do not infer, speculate, generalize, or add context not explicitly stated in the article.
– Use only facts present in the article's text or its first-party, on-page elements (author text, publisher charts/tables/captions). Ignore comments, ads, unrelated widgets, auto-suggested links, or embedded third-party social posts unless the article text explicitly references their content.
– If a metric, quote, or claim isn't in the article, don't include it.
– Paraphrase faithfully; do not embellish or reframe intent.
– If the article cannot support six accurate bullets, respond with an error indicating insufficient content.
– When uncertain, omit rather than guess.

**WRITING STYLE**

– Audience: SMB/mid-market leaders, innovation execs, tech-curious decision makers.
– Tone: forward-looking, strategic, accessible, data-rich.
– Emphasize numbers, adoption metrics, regulatory clarity, and market implications.
– Avoid hype, consumer how-to angles, and speculative fluff.

**OUTPUT FORMAT (plain text only)**

– Two **bolded** headline options (≤ 12 words each).
– Six bullet points. Each bullet MUST be 11–16 words, concise and executive-friendly, emphasizing business or strategic impact.
– One direct URL at the end only. No in-line links. No other links.
– Only reference the single provided article for content creation. Do NOT add additional web sources.

**PROCESS**

1. Verify the article is ≥ 400 words, accessible, and contains enough concrete information for 6 bullets.
2. Extract only what the article states: dates, funding amounts, launches, adoption stats, partner names, roadmap timelines, regulatory milestones. No external context.
3. Draft outputs per the format rules. Ensure bullets are 11–16 words and jargon-light.

**QUALITY CHECKS (must pass before finalizing)**

– Headlines ≤ 12 words; bullets 11–16 words; exactly six bullets.
– Article is ≥ 400 words.
– Every fact appears explicitly in the article; no extrapolation or unverifiable synthesis.
– URL present once at the end; no other links.`;

export function buildUserPrompt(article: {
  url: string;
  title: string;
  body: string;
}): string {
  return `Please analyze this article and create a structured summary following the Disruption Weekly format.

Article URL: ${article.url}
Article Title: ${article.title}

Article Content:
${article.body}

---

INSTRUCTIONS:
1. Create TWO headline options (each ≤ 12 words, bolded with **)
2. Create SIX bullet points (each exactly 11-16 words)
3. Include the article URL once at the end

Return ONLY the structured output in this exact format:

**[First headline option]**

**[Second headline option]**

- [First bullet, 11-16 words]
- [Second bullet, 11-16 words]
- [Third bullet, 11-16 words]
- [Fourth bullet, 11-16 words]
- [Fifth bullet, 11-16 words]
- [Sixth bullet, 11-16 words]

${article.url}`;
}

export function parseWebResponse(response: string): {
  headlinePrimary: string;
  headlineSecondary: string;
  bullets: string[];
  url: string;
} | null {
  try {
    const lines = response.trim().split("\n");

    // Find headlines (lines containing **)
    const headlines = lines
      .filter((line) => line.includes("**"))
      .map((line) => line.replace(/\*\*/g, "").trim())
      .filter(Boolean);

    if (headlines.length < 2) {
      console.error("Not enough headlines found", { headlines, response });
      return null;
    }

    // Find bullets (lines starting with -, •, or numbered)
    const bullets = lines
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed.startsWith("-") ||
               trimmed.startsWith("•") ||
               /^\d+\./.test(trimmed);
      })
      .map((line) => line.trim().replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, ""))
      .filter(Boolean);

    // Accept 5-7 bullets (flexible for minor variations)
    if (bullets.length < 5 || bullets.length > 7) {
      console.error("Expected 6 bullets, got", bullets.length, { bullets, response });
      return null;
    }

    // Take first 6 bullets if there are more
    const finalBullets = bullets.slice(0, 6);

    // Find URL (any line containing http:// or https://)
    const urlLine = lines
      .slice()
      .reverse()
      .find((line) => line.includes("http://") || line.includes("https://"));

    if (!urlLine) {
      console.error("No URL found in response", { response });
      return null;
    }

    // Extract just the URL from the line
    const urlMatch = urlLine.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : urlLine.trim();

    return {
      headlinePrimary: headlines[0],
      headlineSecondary: headlines[1],
      bullets: finalBullets,
      url,
    };
  } catch (error) {
    console.error("Error parsing LLM response:", error, { response });
    return null;
  }
}
