import type { NextConfig } from "next";

/**
 * Static export — served by Nginx, no Node.js at runtime. The browser calls
 * the Rust backend directly via `NEXT_PUBLIC_API_URL` (see `src/config/env.ts`);
 * there is no BFF layer, no Route Handlers, no proxy.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // No server to run the optimizer in a static export.
    unoptimized: true,
  },
};

export default nextConfig;
