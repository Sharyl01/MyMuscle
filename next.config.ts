import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
