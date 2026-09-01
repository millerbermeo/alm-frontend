import type { NextConfig } from "next";

/**
 * The panel talks to the Rust backend only through server-side Route Handlers
 * (`/src/app/api/**`) and the `proxy` (`/src/proxy.ts`). The browser never
 * calls the Rust API directly, so no `NEXT_PUBLIC_*` API URL is exposed.
 *
 * `images.remotePatterns` allows `next/image` to optimise the PUBLIC image
 * URLs the backend returns (S3 / MinIO / CDN origin), configured via
 * `IMAGE_CDN_HOSTNAME`.
 */
const imageHost = process.env.IMAGE_CDN_HOSTNAME;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: imageHost
      ? [
          { protocol: "https", hostname: imageHost },
          { protocol: "http", hostname: imageHost },
        ]
      : [
          { protocol: "http", hostname: "localhost" },
          { protocol: "http", hostname: "127.0.0.1" },
        ],
  },
};

export default nextConfig;
