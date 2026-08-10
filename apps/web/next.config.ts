import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
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

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
