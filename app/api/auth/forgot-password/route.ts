import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/cors";
import crypto from "crypto";

// Token is valid for 1 hour
const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function POST(request: NextRequest) {
  const corsError = rejectCrossOrigin(request);
  if (corsError) return corsError;

  // Strict rate limit: 3 requests per hour per IP to prevent email flooding
  const ip = getClientIp(request);
  const rl = checkRateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const email = (body.email ?? "").toString().toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return the same response whether the email exists or not —
    // prevents user enumeration.
    const genericResponse = NextResponse.json({
      message: "If that email is registered, you'll receive a reset link shortly.",
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return genericResponse;

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Generate a cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    await sendPasswordResetEmail(email, rawToken);

    return genericResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    // Return the same generic message on error too — don't leak server details
    return NextResponse.json({
      message: "If that email is registered, you'll receive a reset link shortly.",
    });
  }
}
