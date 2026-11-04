import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    domains: ["localhost", "asanausercontent.com"],
  },
  webpack: (config) => {
    config.resolve.modules = [path.resolve(__dirname, 'node_modules')];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: false,
    };
    return config;
  },
};

export default nextConfig;
