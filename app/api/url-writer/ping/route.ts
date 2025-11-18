import { NextRequest, NextResponse } from "next/server";
import { validateAuth, createAuthErrorResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = validateAuth(request);
  if (!authResult.valid) {
    return createAuthErrorResponse(authResult.error || "Authentication failed");
  }

  // Return success
  return NextResponse.json({
    status: "ok",
    message: "Disruption Weekly URL Writer API is running",
    timestamp: new Date().toISOString(),
  });
}

export const runtime = "edge";
