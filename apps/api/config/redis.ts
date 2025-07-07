import { Secret } from '@adonisjs/core/helpers';
import { defineConfig } from '@adonisjs/redis';
import type { InferConnections } from '@adonisjs/redis/types';
import env from '#start/env';

export const redisUrl = new Secret(new URL(env.get('REDIS_URL')));

const redisConfig = defineConfig({
	connection: 'main',

	connections: {
		/*
    |--------------------------------------------------------------------------
    | The default connection
    |--------------------------------------------------------------------------
    |
    | The main connection you want to use to execute redis commands. The same
    | connection will be used by the session provider, if you rely on the
    | redis driver.
    |
    */
		main: {
			host: redisUrl.release().hostname,
			port: redisUrl.release().port,
			password: redisUrl.release().password,
			db: 0,
			keyPrefix: '',
			retryStrategy(times) {
				return times > 10 ? null : times * 50;
			},
		},
	},
});

export default redisConfig;

declare module '@adonisjs/redis/types' {
	export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
