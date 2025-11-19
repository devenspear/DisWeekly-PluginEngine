/**
 * Fact Verification Configuration
 *
 * Tune these settings to control how strict the fact verification is.
 * Lower values = more lenient, higher values = more strict
 */

export const VERIFICATION_CONFIG = {
  /**
   * Minimum number of bullets (out of 6) that must pass verification
   * Default: 5 (allows 1 bullet to fail)
   * Range: 3-6
   * - 3: Very lenient (50% must pass)
   * - 4: Lenient (66% must pass)
   * - 5: Moderate (83% must pass) ← DEFAULT
   * - 6: Strict (100% must pass)
   */
  minPassingBullets: parseInt(process.env.FACT_VERIFY_MIN_PASSING_BULLETS || "5", 10),

  /**
   * Minimum average confidence score across all bullets
   * Default: 70%
   * Range: 50-90
   * - 50-60: Very lenient
   * - 60-70: Lenient
   * - 70-80: Moderate ← DEFAULT
   * - 80-90: Strict
   */
  minAverageConfidence: parseInt(process.env.FACT_VERIFY_MIN_CONFIDENCE || "70", 10),

  /**
   * Enable/disable fact verification entirely
   * Default: true
   * Set to false to disable verification (not recommended for production)
   */
  enabled: process.env.FACT_VERIFY_ENABLED !== "false",
};

/**
 * Log the current configuration on startup
 */
export function logVerificationConfig(): void {
  if (!VERIFICATION_CONFIG.enabled) {
    console.warn("⚠️  FACT VERIFICATION DISABLED - All outputs will pass without verification");
    return;
  }

  console.log("✓ Fact Verification Config:");
  console.log(`  - Min passing bullets: ${VERIFICATION_CONFIG.minPassingBullets}/6`);
  console.log(`  - Min average confidence: ${VERIFICATION_CONFIG.minAverageConfidence}%`);
}
