import redis from '@adonisjs/redis/services/main';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { cookieDomain, origin, rpId } from '#config/auth';
import * as Schema from '#database/schema';
import env from '#start/env';
import { ph } from '../analytics/analytics_service.ts';
import { AnalyticsEvent } from '../analytics/schemas/analytics_event.ts';
import { db } from '../db/db_service.ts';
import { createAccountAuth } from './create_account_auth.ts';

export const accountAuth = createAccountAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		transaction: true,
		schema: {
			user: Schema.users,
			account: Schema.authAccounts,
			passkey: Schema.credentials,
			session: Schema.authSessions,
			verification: Schema.authVerifications,
		},
	}),
	secondaryStorage: {
		get: (key) => redis.get(`better-auth:${key}`),
		getAndDelete: (key) => redis.getdel(`better-auth:${key}`),
		increment: async (key, ttl) =>
			Number(
				await redis.eval(
					"local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n",
					1,
					`better-auth:${key}`,
					ttl,
				),
			),
		set: async (key, value, ttl) => {
			if (ttl) await redis.set(`better-auth:${key}`, value, 'EX', ttl);
			else await redis.set(`better-auth:${key}`, value);
		},
		delete: async (key) => {
			await redis.del(`better-auth:${key}`);
		},
	},
	// Reuse the application's existing signing secret; no additional external configuration.
	secret: env.get('APP_KEY'),
	baseURL:
		env.get('NODE_ENV') === 'development'
			? (env.get('PORTLESS_URL') ?? 'http://localhost:3333')
			: 'https://api.interval.so',
	origin,
	rpId,
	cookieDomain,
	onSignup: ({ id, name }) => {
		ph.identify({ distinctId: id, properties: { name, date_created: new Date() } });
		ph.capture({ distinctId: id, event: AnalyticsEvent.UserSignedUp });
	},
	onLogin: (id) => {
		ph.capture({ distinctId: id, event: AnalyticsEvent.UserLoggedIn });
	},
});
