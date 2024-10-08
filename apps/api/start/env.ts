/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default await Env.create(new URL('../../../', import.meta.url), {
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	NODE_ENV: Env.schema.enum(['development', 'production', 'staging'] as const),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	PORT: Env.schema.number.optional(),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	APP_KEY: Env.schema.string(),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	HOST: Env.schema.string.optional({ format: 'host' }),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	LOG_LEVEL: Env.schema.enum.optional(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	POSTGRES_URL: Env.schema.string(),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	REDIS_URL: Env.schema.string(),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	COOKIE_DOMAIN: Env.schema.string({ format: 'host' }),

	// biome-ignore lint/style/useNamingConvention: These are environment variables
	POSTHOG_HOST: Env.schema.string(),
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	POSTHOG_KEY: Env.schema.string(),

	/*
  |----------------------------------------------------------
  | Variables for configuring @rlanz/sentry package
  |----------------------------------------------------------
  */
	// biome-ignore lint/style/useNamingConvention: These are environment variables
	SENTRY_DSN_API: Env.schema.string(),
});
