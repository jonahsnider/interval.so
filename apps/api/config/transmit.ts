import { defineConfig } from '@adonisjs/transmit';
import { redis } from '@adonisjs/transmit/transports';
import { redisUrl } from './redis.js';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default defineConfig({
	pingInterval: false,
	transport: {
		// Redis transport is needed so that publishing a change from instance A can be recived by subscribers on instance B
		driver: redis({
			host: redisUrl.release().hostname,
			port: Number(redisUrl.release().port),
			password: redisUrl.release().password,
			db: 0,
			keyPrefix: 'transmit',
			retryStrategy(times) {
				return times > 10 ? null : times * 50;
			},
		}),
	},
});
