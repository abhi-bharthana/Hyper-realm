import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.29.67', 'localhost', '127.0.0.1'],
  
  // 🔥 MAGIC FIX: Ab hum safely port 8088 par route karenge
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8088/api/v1/:path*', 
      },
    ];
  },
};

export default nextConfig;