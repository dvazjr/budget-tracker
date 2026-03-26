import { NextResponse } from "next/server";

/**
 * Rejects cross-origin requests that don't originate from the app's own URL.
 * Returns a 403 NextResponse when the request should be blocked, or null when it's allowed.
 *
 * Allowed origins:
 *   1. NEXTAUTH_URL  — the canonical production URL (e.g. https://budget-tracker-kappa-dusky.vercel.app)
 *   2. VERCEL_URL   — Vercel auto-injects this as the current deployment's host (no protocol prefix)
 *                     so we build https://<VERCEL_URL> and accept that too.
 *
 * Skipped in local development (no NEXTAUTH_URL set) so curl/Postman still work.
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return null; // dev mode — no enforcement

  const origin = request.headers.get("origin");
    if (!origin) return null; // non-browser requests (server-to-server) are allowed

  try {
        const allowedOrigins = new Set<string>();

      // Primary: the canonical production URL
      allowedOrigins.add(new URL(appUrl).origin);

      // Secondary: the current Vercel deployment URL (covers preview deployments)
      const vercelUrl = process.env.VERCEL_URL;
        if (vercelUrl) {
                allowedOrigins.add(`https://${vercelUrl}`);
        }

      if (!allowedOrigins.has(origin)) {
              return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  } catch {
        // If NEXTAUTH_URL is malformed, fail open to avoid breaking the app.
  }

  return null;
}
