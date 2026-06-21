import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
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
      {
        protocol: "https",
        hostname: "*.nguonc.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.phimimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "phimimg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
