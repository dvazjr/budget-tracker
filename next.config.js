/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS (enable once on production behind HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disable browser features not needed
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + React hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: inline allowed for Tailwind/Radix
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs for chart rendering
      "img-src 'self' data: blob:",
      // Fonts: self only
      "font-src 'self'",
      // API calls: self + Supabase + Gemini
      `connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com`,
      // Workers for PDF.js
      "worker-src 'self' blob:",
      // Frames: none
      "frame-src 'none'",
      // Objects: none
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
      // Form submissions: self only
      "form-action 'self'",
    ].join("; "),
  },
  // Prevent XSS (legacy header, CSP is the modern approach)
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
