import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:filename",
        destination: "/api/uploads/:filename",
      },
      {
        source: "/skhpk-ttd/:filename",
        destination: "/api/skhpk/specimen/:filename",
      },
    ];
  },
};

export default nextConfig;
