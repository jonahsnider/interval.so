import { defineConfig, targets } from '@adonisjs/core/logger';
import app from '@adonisjs/core/services/app';
import env from '#start/env';

const loggerConfig = defineConfig({
	default: 'app',

	/**
	 * The loggers object can be used to define multiple loggers.
	 * By default, we configure only one logger (named "app").
	 */
	loggers: {
		app: {
			enabled: true,
			name: 'hours-api',
			level: env.get('LOG_LEVEL', 'trace'),
			transport: {
				targets: targets()
					.pushIf(!app.inProduction, targets.pretty())
					.pushIf(app.inProduction, targets.file({ destination: 1 }))
					.toArray(),
			},
		},
	},
});

export default loggerConfig;

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
	export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
