import { NextRequest } from "next/server";

// Simple bearer token authentication
export function validateAuth(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      valid: false,
      error: "Missing Authorization header",
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      valid: false,
      error: "Invalid Authorization format. Expected: Bearer <token>",
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // Get valid tokens from environment
  const validTokens = (process.env.AUTH_TOKENS || "").split(",").map((t) => t.trim()).filter(Boolean);

  if (validTokens.length === 0) {
    console.warn("No AUTH_TOKENS configured in environment");
    return {
      valid: false,
      error: "Server authentication not configured",
    };
  }

  if (!validTokens.includes(token)) {
    return {
      valid: false,
      error: "Invalid authentication token",
    };
  }

  return { valid: true };
}

// Generate secure random token (for creating new tokens)
export function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const tokenLength = 32;
  let token = "";

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }

  return token;
}

// Helper to create auth error response
export function createAuthErrorResponse(error: string) {
  return new Response(
    JSON.stringify({
      status: "error",
      reason: "authentication_failed",
      details: error,
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
