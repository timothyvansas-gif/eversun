import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.53", "localhost:3000"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
