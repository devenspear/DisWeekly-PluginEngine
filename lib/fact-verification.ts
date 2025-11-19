/**
 * Fact Verification System
 *
 * Verifies that bullet points contain only facts that exist in the source article.
 * Works by extracting key entities (numbers, names, dates) from bullets and checking
 * if they appear in the source text.
 *
 * This is a programmatic check that runs AFTER LLM generation to catch hallucinations.
 */

export interface VerificationResult {
  bulletIndex: number;
  bullet: string;
  factsFound: string[];
  factsMissing: string[];
  confidenceScore: number; // 0-100
  passed: boolean;
}

export interface OverallVerification {
  passed: boolean;
  averageConfidence: number;
  bulletResults: VerificationResult[];
  rejectionReason?: string;
}

/**
 * Extract key facts from a bullet point
 * Looks for: numbers, percentages, dollar amounts, proper nouns, dates, company names
 */
function extractKeyFacts(bullet: string): string[] {
  const facts: string[] = [];

  // Extract numbers with units/context (e.g., "500 million", "$2.5B", "40%")
  const numberPatterns = [
    /\$[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|trillion|M|B|T))?/gi,  // Money
    /\d+(?:\.\d+)?%/g,                                                   // Percentages
    /\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|trillion))?/gi,  // Large numbers
    /\d{4}/g,                                                            // Years
  ];

  numberPatterns.forEach(pattern => {
    const matches = bullet.match(pattern);
    if (matches) {
      facts.push(...matches.map(m => m.toLowerCase().trim()));
    }
  });

  // Extract quoted text
  const quotes = bullet.match(/"([^"]+)"/g);
  if (quotes) {
    facts.push(...quotes.map(q => q.replace(/"/g, '').toLowerCase().trim()));
  }

  // Extract potential proper nouns (capitalized words, but filter common words)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const words = bullet.split(/\s+/);
  const properNouns = words.filter(word => {
    const cleaned = word.replace(/[^a-zA-Z]/g, '');
    return cleaned.length > 2 &&
           cleaned[0] === cleaned[0].toUpperCase() &&
           !commonWords.has(cleaned.toLowerCase());
  });

  if (properNouns.length > 0) {
    facts.push(...properNouns.map(n => n.toLowerCase().trim()));
  }

  // Extract significant phrases (3+ word sequences that aren't common)
  const phrases = bullet.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,}\b/g);
  if (phrases) {
    facts.push(...phrases.map(p => p.toLowerCase().trim()));
  }

  return [...new Set(facts)]; // Remove duplicates
}

/**
 * Check if a fact exists in the source article
 * Uses fuzzy matching to account for slight variations
 */
function factExistsInSource(fact: string, sourceText: string): boolean {
  const normalizedSource = sourceText.toLowerCase();
  const normalizedFact = fact.toLowerCase();

  // Direct match
  if (normalizedSource.includes(normalizedFact)) {
    return true;
  }

  // For numbers with word forms (e.g., "2.5 billion" vs "$2.5B")
  // Check if the core number exists
  const numberMatch = normalizedFact.match(/[\d,]+(?:\.\d+)?/);
  if (numberMatch) {
    const coreNumber = numberMatch[0].replace(/,/g, '');
    if (normalizedSource.includes(coreNumber)) {
      return true;
    }
  }

  // For proper nouns, check if the word appears (accounts for different contexts)
  const cleanFact = normalizedFact.replace(/[^a-z0-9\s]/g, '');
  if (cleanFact.length > 3) {
    const words = cleanFact.split(/\s+/);
    const significantWords = words.filter(w => w.length > 3);

    if (significantWords.length > 0) {
      // Check if all significant words appear (allows for reordering)
      const allWordsPresent = significantWords.every(word =>
        normalizedSource.includes(word)
      );

      if (allWordsPresent) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Verify a single bullet point against the source article
 */
function verifyBullet(bullet: string, sourceText: string, index: number): VerificationResult {
  const facts = extractKeyFacts(bullet);

  // If no facts were extracted, use a more lenient check
  if (facts.length === 0) {
    // Check if at least some substantial words from the bullet exist in source
    const words = bullet.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const wordsInSource = words.filter(word => sourceText.toLowerCase().includes(word));
    const wordMatchRatio = words.length > 0 ? wordsInSource.length / words.length : 0;

    return {
      bulletIndex: index,
      bullet,
      factsFound: [],
      factsMissing: [],
      confidenceScore: Math.round(wordMatchRatio * 100),
      passed: wordMatchRatio >= 0.4, // At least 40% of significant words must be in source
    };
  }

  const factsFound: string[] = [];
  const factsMissing: string[] = [];

  facts.forEach(fact => {
    if (factExistsInSource(fact, sourceText)) {
      factsFound.push(fact);
    } else {
      factsMissing.push(fact);
    }
  });

  const confidenceScore = facts.length > 0
    ? Math.round((factsFound.length / facts.length) * 100)
    : 0;

  // Pass if at least 60% of facts are found, or if all facts are found
  const passed = confidenceScore >= 60;

  return {
    bulletIndex: index,
    bullet,
    factsFound,
    factsMissing,
    confidenceScore,
    passed,
  };
}

/**
 * Verify all bullets against the source article
 *
 * @param bullets - Array of 6 bullet points from LLM
 * @param sourceText - Original article text from the webpage
 * @param minPassingBullets - Minimum number of bullets that must pass (default: 5 out of 6)
 * @param minAverageConfidence - Minimum average confidence score (default: 70%)
 */
export function verifyBullets(
  bullets: string[],
  sourceText: string,
  minPassingBullets: number = 5,
  minAverageConfidence: number = 70
): OverallVerification {

  const bulletResults = bullets.map((bullet, index) =>
    verifyBullet(bullet, sourceText, index)
  );

  const passingBullets = bulletResults.filter(r => r.passed).length;
  const averageConfidence = Math.round(
    bulletResults.reduce((sum, r) => sum + r.confidenceScore, 0) / bulletResults.length
  );

  const passed = passingBullets >= minPassingBullets && averageConfidence >= minAverageConfidence;

  let rejectionReason: string | undefined;
  if (!passed) {
    if (passingBullets < minPassingBullets) {
      rejectionReason = `Only ${passingBullets} out of ${bullets.length} bullets passed verification (need ${minPassingBullets})`;
    } else {
      rejectionReason = `Average confidence ${averageConfidence}% is below threshold of ${minAverageConfidence}%`;
    }
  }

  return {
    passed,
    averageConfidence,
    bulletResults,
    rejectionReason,
  };
}

/**
 * Quick verification for testing/debugging
 */
export function quickVerify(bullets: string[], sourceText: string): void {
  const result = verifyBullets(bullets, sourceText);

  console.log("\n=== FACT VERIFICATION RESULTS ===");
  console.log(`Overall: ${result.passed ? "✓ PASSED" : "✗ FAILED"}`);
  console.log(`Average Confidence: ${result.averageConfidence}%`);

  if (result.rejectionReason) {
    console.log(`Rejection Reason: ${result.rejectionReason}`);
  }

  console.log("\nPer-Bullet Results:");
  result.bulletResults.forEach(br => {
    console.log(`\n[${br.passed ? "✓" : "✗"}] Bullet ${br.bulletIndex + 1} (${br.confidenceScore}%)`);
    console.log(`    "${br.bullet}"`);
    if (br.factsFound.length > 0) {
      console.log(`    Found: ${br.factsFound.join(", ")}`);
    }
    if (br.factsMissing.length > 0) {
      console.log(`    Missing: ${br.factsMissing.join(", ")}`);
    }
  });
}
