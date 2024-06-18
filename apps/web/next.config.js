const { withPlausibleProxy } = require('next-plausible');
const getBaseApiUrl = require('./shared');
const dotenv = require('dotenv');
const path = require('node:path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = withPlausibleProxy()({
	productionBrowserSourceMaps: true,
	env: {
		// biome-ignore lint/style/useNamingConvention: This is an environment variable
		NEXT_PUBLIC_API_URL: getBaseApiUrl(),
	},
	// Needed for a Next.js bug https://github.com/vercel/next.js/discussions/32237#discussioncomment-4793595
	webpack: (config) => {
		config.resolve.extensionAlias = {
			'.js': ['.ts', '.tsx', '.js'],
		};

		return config;
	},
});

module.exports = nextConfig;
