import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedPath = path.resolve(__dirname, '../../../packages/shared/src');

const nextConfig: NextConfig = {
  transpilePackages: ['@todoist/shared'],
  experimental: {
    externalDir: true,
  },
  turbopack: {
    resolveAlias: {
      '@todoist/shared': sharedPath,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@todoist/shared': sharedPath,
    };
    return config;
  },
};

export default nextConfig;
