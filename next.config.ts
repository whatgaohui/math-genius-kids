import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For APK builds, temporarily set: output: 'export'
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
