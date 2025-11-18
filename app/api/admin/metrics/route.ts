import { NextRequest, NextResponse } from "next/server";
import { validateAuth, createAuthErrorResponse } from "@/lib/auth";
import { metrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = validateAuth(request);
  if (!authResult.valid) {
    return createAuthErrorResponse(authResult.error || "Authentication failed");
  }

  const metricsData = metrics.getMetrics();

  return NextResponse.json({
    status: "ok",
    metrics: metricsData,
    note: "Metrics reset on deployment. Future: migrate to database for persistence.",
  });
}

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = validateAuth(request);
  if (!authResult.valid) {
    return createAuthErrorResponse(authResult.error || "Authentication failed");
  }

  const body = await request.json();

  if (body.action === "reset") {
    metrics.reset();
    return NextResponse.json({
      status: "ok",
      message: "Metrics reset successfully",
    });
  }

  return NextResponse.json(
    { status: "error", message: "Invalid action" },
    { status: 400 }
  );
}
