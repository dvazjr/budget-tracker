import { NextResponse } from "next/server";

/**
 * Rejects cross-origin requests that don't originate from the app's own URL.
 * Returns a 403 NextResponse when the request should be blocked, or null when it's allowed.
 *
 * Only enforced when NEXTAUTH_URL is set (i.e. in production / staging).
 * Skipped in local development so curl/Postman still work.
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return null; // dev mode — no enforcement

  const origin = request.headers.get("origin");
  if (!origin) return null; // non-browser requests (server-to-server) are allowed

  try {
    const allowedOrigin = new URL(appUrl).origin;
    if (origin !== allowedOrigin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    // If NEXTAUTH_URL is malformed, fail open to avoid breaking the app.
  }

  return null;
}
