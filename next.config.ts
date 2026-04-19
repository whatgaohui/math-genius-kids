import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For APK builds, temporarily set: output: 'export'
  // API routes (e.g. TTS) require server runtime, so no export during dev
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
