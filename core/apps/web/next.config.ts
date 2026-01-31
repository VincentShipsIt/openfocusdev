import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@todoist/shared'],
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@todoist/shared': path.resolve(__dirname, '../../packages/shared/src'),
    };
    return config;
  },
};

export default nextConfig;
