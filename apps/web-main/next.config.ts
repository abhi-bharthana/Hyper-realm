import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mobile testing aur cross-network HMR (Hot Module Reloading) allow karne ke liye
  allowedDevOrigins: ['192.168.29.67', 'localhost', '127.0.0.1'],
};

export default nextConfig;