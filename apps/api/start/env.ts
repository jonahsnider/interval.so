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

export default await Env.create(new URL('../../../', import.meta.url), {
	NODE_ENV: Env.schema.enum(['development', 'production', 'staging'] as const),
	PORT: Env.schema.number.optional(),
	APP_KEY: Env.schema.string(),
	HOST: Env.schema.string.optional({ format: 'host' }),
	LOG_LEVEL: Env.schema.enum.optional(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
	POSTGRES_URL: Env.schema.string(),
	REDIS_URL: Env.schema.string(),
	COOKIE_DOMAIN: Env.schema.string({ format: 'host' }),

	POSTHOG_HOST: Env.schema.string(),
	POSTHOG_KEY: Env.schema.string(),

	/*
  |----------------------------------------------------------
  | Variables for configuring @rlanz/sentry package
  |----------------------------------------------------------
  */
	SENTRY_DSN_API: Env.schema.string(),
});
