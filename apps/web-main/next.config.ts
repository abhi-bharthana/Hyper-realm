import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 Strict Reverse Proxy: Frontend APIs sidha NGINX (8088) par jayengi
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8088/api/v1/:path*', 
      },
    ];
  },
  // Ignore typescript errors during dev/build strictly for phase 1 testing
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;