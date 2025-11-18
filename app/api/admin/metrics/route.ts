import { NextRequest, NextResponse } from "next/server";
import { metrics } from "@/lib/metrics";

function validateAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const password = authHeader.substring(7);
  const adminPassword = process.env.ADMIN_PASSWORD || "ADMINp@ss2025";

  return password === adminPassword;
}

export async function GET(request: NextRequest) {
  // Validate admin authentication
  if (!validateAdminAuth(request)) {
    return NextResponse.json(
      { status: "error", message: "Invalid admin password" },
      { status: 401 }
    );
  }

  const metricsData = metrics.getMetrics();

  return NextResponse.json({
    status: "ok",
    metrics: metricsData,
    note: "Metrics reset on deployment. Future: migrate to database for persistence.",
  });
}

export async function POST(request: NextRequest) {
  // Validate admin authentication
  if (!validateAdminAuth(request)) {
    return NextResponse.json(
      { status: "error", message: "Invalid admin password" },
      { status: 401 }
    );
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
