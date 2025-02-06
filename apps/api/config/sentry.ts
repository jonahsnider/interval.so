import app from '@adonisjs/core/services/app';
import { defineConfig } from '@rlanz/sentry';
import env from '#start/env';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default defineConfig({
	/**
	 * Enable or disable Sentry
	 */
	// TODO: Turning Sentry on causes critical errors with drizzle-orm :(
	// See: https://github.com/drizzle-team/drizzle-orm/issues/4079 and https://github.com/drizzle-team/drizzle-orm/issues/3726
	enabled: false,

	/**
	 * The environment Sentry is running in
	 */
	environment: app.nodeEnvironment,

	/**
	 * The DSN of the project
	 */
	dsn: env.get('SENTRY_DSN_API'),

	/**
	 * Additional integrations to use with the Sentry SDK
	 * @see https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/#available-integrations
	 */
	integrations: [
		// TODO: Add node profiling integration here once @rlanz/sentry is updated to Sentry v8 - https://github.com/RomainLanz/sentry/issues/1
	],

	/**
	 * The sample rate of traces to send to Sentry
	 * @see https://docs.sentry.io/platforms/javascript/guides/node/configuration/sampling
	 */
	tracesSampleRate: 0.2,
});
