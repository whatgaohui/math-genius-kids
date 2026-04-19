import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Do NOT use output: 'export' - API routes (e.g. TTS) require server runtime
  images: {
    unoptimized: true,
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
