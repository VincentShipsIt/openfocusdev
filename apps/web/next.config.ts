import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
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

