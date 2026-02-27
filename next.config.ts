import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.clerk.dev"
      },
      {
        protocol: "https",
        hostname: "img.clerk.com"
      }
    ]
  }
};

export default nextConfig;
