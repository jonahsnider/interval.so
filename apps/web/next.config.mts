import { withSentryConfig } from '@sentry/nextjs/config';
import dotenv from 'dotenv';
import { withPlausibleProxy } from 'next-plausible';
import path from 'node:path';

import getBaseApiUrl from './shared.js';

dotenv.config({ path: path.join(import.meta.dirname, '..', '..', '.env') });

export default withSentryConfig(
	withPlausibleProxy({
		src: 'https://plausible.io/js/pa-ZdvdmM0wlrTnoHpJ0l-kO.js',
	})({
		cacheComponents: true,
		images: {
			qualities: [75, 95],
		},
		productionBrowserSourceMaps: true,
		env: {
			NEXT_PUBLIC_API_URL: getBaseApiUrl(),
			POSTHOG_HOST: process.env.POSTHOG_HOST,
			POSTHOG_KEY: process.env.POSTHOG_KEY,
		},
	}),
	{
		// For all available options, see:
		// https://www.npmjs.com/package/@sentry/webpack-plugin#options

		org: 'interval-so',
		project: 'interval-web',

		// Only print logs for uploading source maps in CI
		silent: !process.env.CI,

		// For all available options, see:
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

		// Upload a larger set of source maps for prettier stack traces (increases build time)
		widenClientFileUpload: true,

		// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
		// This can increase your server load as well as your hosting bill.
		// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
		// side errors will fail.
		tunnelRoute: '/__s',

		webpack: {
			// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
			// See the following for more information:
			// https://docs.sentry.io/product/crons/
			// https://vercel.com/docs/cron-jobs
			automaticVercelMonitors: true,

			// Tree-shaking options for reducing bundle size
			treeshake: {
				// Automatically tree-shake Sentry logger statements to reduce bundle size
				removeDebugLogging: true,
			},
		},
	},
);
