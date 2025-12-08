import app from '@adonisjs/core/services/app';
import { defineConfig } from '@rlanz/sentry';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import env from '#start/env';

export default defineConfig({
	/**
	 * Enable or disable Sentry
	 */
	enabled: true,

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
	integrations: [nodeProfilingIntegration],

	/**
	 * The sample rate of traces to send to Sentry
	 * @see https://docs.sentry.io/platforms/javascript/guides/node/configuration/sampling
	 */
	tracesSampleRate: 0.2,
});
