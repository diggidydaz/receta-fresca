import type { NextConfig } from "next";

// With NEXT_PUBLIC_SUPABASE_PROXY=1 the browser talks to Supabase through this app's own address,
// and the app passes each request on to NEXT_PUBLIC_SUPABASE_URL. Needed when Supabase is only
// reachable from the machine running the app (a VM with a local Supabase, opened from another computer).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const proxySupabase = process.env.NEXT_PUBLIC_SUPABASE_PROXY === "1" && Boolean(supabaseUrl);

const nextConfig: NextConfig = {
  // A second build folder lets the browser-only demo and the server build sit side by side (scripts/e2e-server.mjs).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    if (!proxySupabase) return [];
    return ["auth", "rest", "realtime"].map((svc) => ({ source: `/${svc}/v1/:path*`, destination: `${supabaseUrl}/${svc}/v1/:path*` }));
  },
  // The service worker must never be cached, so a fixed version reaches phones right away.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
