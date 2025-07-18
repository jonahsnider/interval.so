import app from '@adonisjs/core/services/app';
import { defineConfig, stores } from '@adonisjs/session';
import { convert } from 'convert';
import env from '#start/env';

const sessionConfig = defineConfig({
	enabled: true,
	cookieName: 'adonis-session',

	/**
	 * When set to true, the session id cookie will be deleted
	 * once the user closes the browser.
	 */
	clearWithBrowser: false,

	/**
	 * Define how long to keep the session data alive without
	 * any activity.
	 */
	age: convert(3, 'months').to('seconds'),

	/**
	 * Configuration for session cookie and the
	 * cookie store
	 */
	cookie: {
		path: '/',
		httpOnly: true,
		secure: app.inProduction,
		sameSite: 'lax',
		domain: env.get('COOKIE_DOMAIN'),
	},

	/**
	 * The store to use. Make sure to validate the environment
	 * variable in order to infer the store name without any
	 * errors.
	 */
	store: 'redis',

	/**
	 * List of configured stores. Refer documentation to see
	 * list of available stores and their config.
	 */
	stores: {
		redis: stores.redis({
			connection: 'main',
		}),
	},
});

export default sessionConfig;
