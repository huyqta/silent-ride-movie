import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.ophim.live",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ophim1.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ophim.cc",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
