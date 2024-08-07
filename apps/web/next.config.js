const { withPlausibleProxy } = require('next-plausible');
const getBaseApiUrl = require('./shared');
const dotenv = require('dotenv');
const path = require('node:path');
const { withSentryConfig } = require('@sentry/nextjs');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

/** @type {import('next').NextConfig} */

module.exports = withSentryConfig(
	withPlausibleProxy()({
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
	}),
	{
		// For all available options, see:
		// https://github.com/getsentry/sentry-webpack-plugin#options

		org: 'interval-so',
		project: 'interval-web',

		// Only print logs for uploading source maps in CI
		silent: !process.env.CI,

		// For all available options, see:
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

		// Upload a larger set of source maps for prettier stack traces (increases build time)
		widenClientFileUpload: true,

		// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
		// This can increase your server load as well as your hosting bill.
		// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
		// side errors will fail.
		tunnelRoute: '/__s',

		// Hides source maps from generated client bundles
		hideSourceMaps: false,

		// Automatically tree-shake Sentry logger statements to reduce bundle size
		disableLogger: true,

		// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
		// See the following for more information:
		// https://docs.sentry.io/product/crons/
		// https://vercel.com/docs/cron-jobs
		automaticVercelMonitors: true,
	},
);
