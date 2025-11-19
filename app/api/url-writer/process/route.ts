import { NextRequest, NextResponse } from "next/server";
import { validateAuth, createAuthErrorResponse } from "@/lib/auth";
import { processArticle } from "@/lib/llm-clients";
import { validateArticleContent, validateOutput } from "@/lib/validation";
import { metrics } from "@/lib/metrics";
import { verifyBullets } from "@/lib/fact-verification";
import { VERIFICATION_CONFIG } from "@/lib/verification-config";
import type { CaptureRequest, UrlWriterOutput } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate authentication
    const authResult = validateAuth(request);
    if (!authResult.valid) {
      return createAuthErrorResponse(authResult.error || "Authentication failed");
    }

    // Check for override parameter
    const { searchParams } = new URL(request.url);
    const override = searchParams.get("override") === "true";

    if (override) {
      console.log("⚠️  Override mode enabled - skipping fact verification");
    }

    // Parse request body
    const body: CaptureRequest = await request.json();

    // Validate article content
    const contentValidation = validateArticleContent({
      url: body.url,
      body: body.body,
      estimatedWordCount: body.meta.estimatedWordCount,
    });

    if (!contentValidation.valid) {
      const responseTime = Date.now() - startTime;
      metrics.trackProcessing(responseTime, "reject");

      const response: UrlWriterOutput = {
        status: "reject",
        reason: "article_validation_failed",
        details: contentValidation.errors.join("; "),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Process with LLM
    console.log(`Processing article: ${body.url}${override ? " (OVERRIDE MODE)" : ""}`);
    const llmOutput = await processArticle({
      url: body.url,
      title: body.title,
      body: body.body,
      override,
    });

    // Validate LLM output
    const outputValidation = validateOutput(llmOutput);

    if (!outputValidation.valid) {
      console.error("LLM output validation failed:", outputValidation.errors);
      const responseTime = Date.now() - startTime;
      metrics.trackProcessing(responseTime, "reject");

      const response: UrlWriterOutput = {
        status: "reject",
        reason: "output_validation_failed",
        details: outputValidation.errors.join("; "),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verify facts against source article (if enabled and not overridden)
    let factVerification;
    if (VERIFICATION_CONFIG.enabled && !override) {
      factVerification = verifyBullets(
        llmOutput.bullets,
        body.body,
        VERIFICATION_CONFIG.minPassingBullets,
        VERIFICATION_CONFIG.minAverageConfidence
      );

      if (!factVerification.passed) {
        console.error("Fact verification failed:", factVerification.rejectionReason);
        console.error("Verification details:", factVerification.bulletResults.map(br => ({
          bullet: br.bullet,
          confidence: br.confidenceScore,
          missing: br.factsMissing,
        })));

        const responseTime = Date.now() - startTime;
        metrics.trackProcessing(responseTime, "reject");

        const response: UrlWriterOutput = {
          status: "reject",
          reason: "fact_verification_failed",
          details: factVerification.rejectionReason || "Generated content contains facts not found in source article",
        };
        return NextResponse.json(response, { status: 400 });
      }

      console.log(`Fact verification passed with ${factVerification.averageConfidence}% confidence`);
    } else if (override) {
      console.warn("⚠️  Override enabled - skipping fact verification");
    } else {
      console.warn("⚠️  Fact verification is disabled - skipping verification step");
    }

    // Create successful response
    const articleId = crypto.randomUUID();
    const response: UrlWriterOutput = {
      status: "ok",
      articleId,
      output: {
        headlinePrimary: llmOutput.headlinePrimary,
        headlineSecondary: llmOutput.headlineSecondary,
        bullets: llmOutput.bullets,
        url: body.url,
      },
      validation: {
        wordCount: body.meta.estimatedWordCount,
        bulletsCount: llmOutput.bullets.length,
        headlinesWordCounts: outputValidation.headlinesWordCounts,
        bulletsWordCounts: outputValidation.bulletsWordCounts,
        sourcePurityChecksPassed: factVerification?.passed ?? false,
        factVerificationConfidence: factVerification?.averageConfidence,
      },
    };

    const responseTime = Date.now() - startTime;
    metrics.trackProcessing(responseTime, "ok");

    console.log(`Successfully processed article ${articleId}: ${body.url}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing article:", error);

    const responseTime = Date.now() - startTime;
    metrics.trackProcessing(responseTime, "error");

    const response: UrlWriterOutput = {
      status: "error",
      reason: "processing_failed",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export const maxDuration = 60; // Allow up to 60 seconds for LLM processing
