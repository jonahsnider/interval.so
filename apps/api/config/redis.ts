import { defineConfig } from '@adonisjs/redis';
import type { InferConnections } from '@adonisjs/redis/types';
import env from '#start/env';

const url = new URL(env.get('REDIS_URL'));

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
			host: url.hostname,
			port: url.port,
			password: url.password,
			db: 0,
			keyPrefix: '',
			retryStrategy(times) {
				return times > 10 ? null : times * 50;
			},
		},
	},
});

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default redisConfig;

declare module '@adonisjs/redis/types' {
	export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
