import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";

// Content-Security-Policy allowlist, kept as loose as the app actually
// requires — Razorpay Checkout injects its own iframe/script, Supabase is
// the API/websocket backend, and lesson videos embed from YouTube/Vimeo.
// React's dev mode uses eval() for debugging (stack-trace reconstruction,
// Fast Refresh); it never does in production, per React's own console
// warning. Scope 'unsafe-eval' to development so production keeps the
// stricter policy.
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  `connect-src 'self' ${supabaseOrigin} wss://${supabaseOrigin.replace(/^https?:\/\//, "")} https://api.razorpay.com https://lumberjack.razorpay.com`,
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
