import 'reflect-metadata';
import assert from 'node:assert/strict';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { mock, test } from 'node:test';
import { AppFactory } from '@adonisjs/core/factories/app';
import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { Emitter } from '@adonisjs/core/events';
import type { ContainerBindings } from '@adonisjs/core/types';
import type { ResolvedSessionConfig } from '@adonisjs/session/types';
import { defineConfig, Session, SessionCollection } from '@adonisjs/session';
import { memoryAdapter } from 'better-auth/adapters/memory';
import type { Observable } from '@trpc/server/observable';
import { Subject } from 'rxjs';
import { createAccountAuth, ACCOUNT_MAX_AGE } from '../app/auth/create_account_auth.ts';

const secret = randomBytes(32).toString('hex');
const storage = new Map<string, string>();
const accountAuth = createAccountAuth({
	database: memoryAdapter({ user: [], account: [], session: [], verification: [], passkey: [] }),
	secret,
	baseURL: 'https://api.interval.so',
	origin: 'https://interval.so',
	rpId: 'interval.so',
	secondaryStorage: {
		get: async (key) => storage.get(key) ?? null,
		getAndDelete: async (key) => {
			const value = storage.get(key);
			storage.delete(key);
			return value ?? null;
		},
		set: async (key, value) => {
			storage.set(key, value);
		},
		delete: async (key) => {
			storage.delete(key);
		},
		increment: async (key) => {
			const value = Number(storage.get(key) ?? 0) + 1;
			storage.set(key, String(value));
			return value;
		},
	},
});
mock.module(new URL('../app/auth/account_auth.ts', import.meta.url).href, { exports: { accountAuth } });
const pendingLocks = new Map<string, Promise<unknown>>();
mock.module(new URL('../app/auth/legacy_session_lock.ts', import.meta.url).href, {
	exports: {
		withLegacySessionLock: async <T>(userId: string, callback: () => Promise<T>) => {
			const result = (pendingLocks.get(userId) ?? Promise.resolve()).then(callback);
			pendingLocks.set(
				userId,
				result.catch(() => {}),
			);
			return result;
		},
	},
});
const { AuthSessionService } = await import('../app/auth/auth_session_service.ts');
const app = new AppFactory<ContainerBindings>().create(new URL('../', import.meta.url));
const config: ResolvedSessionConfig = await defineConfig({
	store: 'memory',
	stores: {},
	age: '30 days',
	cookie: {},
}).resolver(app);
const sessions = new SessionCollection(config);
const authSessions = new AuthSessionService(sessions);

async function auxiliarySession() {
	const session = new Session(config, config.stores.memory!, new Emitter(app), new HttpContextFactory().create());
	await session.initiate(false);
	return session;
}
async function account(userId?: string) {
	const { internalAdapter, authCookies } = await accountAuth.$context;
	if (!userId) {
		userId = randomUUID();
		await internalAdapter.createUser(
			{ id: userId, name: 'Alice', email: `${userId}@users.invalid`, emailVerified: false },
			{ method: 'passkey' },
		);
	}
	const session = await internalAdapter.createSession(userId);
	assert(session);
	const signature = createHmac('sha256', secret).update(session.token).digest('base64');
	const headers = new Headers({
		cookie: `${authCookies.sessionToken.name}=${encodeURIComponent(`${session.token}.${signature}`)}`,
	});
	return { headers, session, userId };
}

async function legacyAccount(userId: string, authenticatedAt = Date.now() - 20 * 86_400_000) {
	const session = await auxiliarySession();
	session.put('userId', userId);
	session.put('authenticatedAt', authenticatedAt);
	session.put('timezone', 'America/Los_Angeles');
	await session.tag(userId);
	await session.commit();
	return session;
}

await test('concurrent old-session requests exchange once, preserve age, and deliver a working cookie', async () => {
	const { userId } = await account();
	const old = await legacyAccount(userId);
	const authenticatedAt = old.get('authenticatedAt');
	const responses: Headers[] = [];
	const headers = Array.from({ length: 3 }, () => new Headers());
	const migrated = await Promise.all(headers.map((header) => authSessions.get(header, (h) => responses.push(h), old)));
	assert(migrated[0]);
	assert(migrated.every((result) => result?.session.token === migrated[0]!.session.token));
	assert.equal(new Date(migrated[0].session.createdAt).getTime(), authenticatedAt);
	assert.equal((await authSessions.get(headers[0]!))?.user.id, userId);
	assert(responses.some((response) => response.getSetCookie().some((cookie) => cookie.includes('HttpOnly'))));
	assert.equal(old.get('timezone'), 'America/Los_Angeles');
	const { internalAdapter } = await accountAuth.$context;
	assert.equal((await internalAdapter.listSessions(userId)).length, 2); // Original Better Auth session + one exchange.

	await accountAuth.api.signOut({ headers: headers[0]! });
	assert.equal(await authSessions.get(new Headers(), () => {}, old), null);
});

await test('revocation covers exchanged and unexchanged cookies, including a concurrent exchange', async () => {
	const current = await account();
	const exchanged = await legacyAccount(current.userId);
	const untouched = await legacyAccount(current.userId);
	const concurrent = await legacyAccount(current.userId);
	const migrated = await authSessions.get(new Headers(), () => {}, exchanged);
	assert(migrated);
	await Promise.all([
		authSessions.revokeSessions(current.userId, current.session.token),
		authSessions.get(new Headers(), () => {}, concurrent),
	]);
	for (const old of [exchanged, untouched, concurrent]) {
		assert.equal(await authSessions.get(new Headers(), () => {}, old), null);
	}
	assert.equal((await authSessions.get(current.headers))?.session.token, current.session.token);
});

await test('exchange rejects expired, future, missing, destroyed, and deleted-user authentication', async () => {
	const { userId } = await account();
	for (const timestamp of [Date.now() - ACCOUNT_MAX_AGE, Date.now() + 86_400_000, NaN]) {
		const old = await legacyAccount(userId, timestamp);
		assert.equal(await authSessions.get(new Headers(), () => {}, old), null);
	}
	const missing = await legacyAccount(userId);
	missing.forget('authenticatedAt');
	await missing.commit();
	assert.equal(await authSessions.get(new Headers(), () => {}, missing), null);
	const destroyed = await legacyAccount(userId);
	await sessions.destroy(destroyed.sessionId);
	assert.equal(await authSessions.get(new Headers(), () => {}, destroyed), null);
	const deleted = await legacyAccount(randomUUID());
	assert.equal(await authSessions.get(new Headers(), () => {}, deleted), null);
	const nearlyExpired = await legacyAccount(userId, Date.now() - ACCOUNT_MAX_AGE + 60_000);
	const migrated = await authSessions.get(new Headers(), () => {}, nearlyExpired);
	assert(migrated);
	assert(
		new Date(migrated.session.expiresAt).getTime() <= Number(nearlyExpired.get('authenticatedAt')) + ACCOUNT_MAX_AGE,
	);
});

await test('revoking other devices preserves the current session and other users in secondary storage', async () => {
	const current = await account();
	const other = await account(current.userId);
	const unrelated = await account();
	await authSessions.revokeSessions(current.userId, current.session.token);
	assert.equal((await authSessions.get(current.headers))?.user.id, current.userId);
	assert.equal(await authSessions.get(other.headers), null);
	assert.equal((await authSessions.get(unrelated.headers))?.user.id, unrelated.userId);
	await authSessions.revokeSessions(current.userId);
	assert.equal(await authSessions.get(current.headers), null);
});

await test('the absolute account lifetime is enforced even after a rolling session refresh', async () => {
	const current = await account();
	const stored = JSON.parse(storage.get(current.session.token)!);
	stored.session.createdAt = new Date(Date.now() - ACCOUNT_MAX_AGE).toISOString();
	stored.session.expiresAt = new Date(Date.now() + 86_400_000).toISOString();
	storage.set(current.session.token, JSON.stringify(stored));
	assert.equal(await authSessions.get(current.headers), null);
	const guest = await auxiliarySession();
	guest.put('guestToken', 'guest');
	await guest.commit();
	await authSessions.assertActive(guest, new Headers(), null);
	await sessions.destroy(guest.sessionId);
	await assert.rejects(authSessions.assertActive(guest, new Headers(), null), { code: 'UNAUTHORIZED' });
});

await test(
	'open subscriptions stop delivering data when their Better Auth session is revoked',
	{ timeout: 5000 },
	async () => {
		const { publicProcedure, router } = await import('../app/trpc/trpc_service.ts');
		const current = await account();
		const session = await auxiliarySession();
		const identity = await authSessions.get(current.headers);
		assert(identity);
		const source = new Subject<number>();
		const caller = router({
			events: publicProcedure.subscription((): Observable<number, unknown> => source),
		}).createCaller({
			session,
			account: identity,
			bouncer: {} as never,
			authHeaders: current.headers,
			setAuthCookies: () => {},
			validateSession: () => authSessions.assertActive(session, current.headers, identity),
		});
		const subscription = await caller.events();
		const received: number[] = [];
		const first = Promise.withResolvers<void>();
		const ended = new Promise<unknown>((resolve) =>
			subscription.subscribe({
				next: (value) => {
					received.push(value);
					first.resolve();
				},
				error: (error) => {
					first.reject(error);
					resolve(error);
				},
			}),
		);
		source.next(1);
		await first.promise;
		assert.deepEqual(received, [1]);
		await authSessions.revokeSessions(current.userId);
		source.next(2);
		assert.equal(((await ended) as { code: string }).code, 'UNAUTHORIZED');
		assert.deepEqual(received, [1]);
	},
);

await test('the HTTP adapter blocks routes that would bypass purpose-bound reauthentication', async () => {
	const { default: Controller } = await import('../app/controllers/account_auth_controller.ts');
	for (const path of [
		'/revoke-other-sessions',
		'/revoke-sessions',
		'/delete-user',
		'/sign-up/email',
		'/change-email',
		'/resume-adonis-session',
	]) {
		const context = new HttpContextFactory().create();
		mock.method(context.request, 'url', () => `/api/auth${path}`);
		await new Controller().index(context);
		assert.equal(context.response.getStatus(), 404);
	}
});

await test('the HTTP adapter forwards signup query parameters and every challenge cookie', async () => {
	const { default: Controller } = await import('../app/controllers/account_auth_controller.ts');
	const context = new HttpContextFactory().create();
	context.session = await auxiliarySession();
	mock.method(context.request, 'url', () => '/api/auth/passkey/generate-register-options');
	mock.method(context.request, 'method', () => 'GET');
	mock.method(
		context.request,
		'completeUrl',
		(includeQueryString?: boolean) =>
			`https://api.interval.so/api/auth/passkey/generate-register-options${includeQueryString ? '?context=Alice' : ''}`,
	);
	mock.method(context.request, 'headers', () => ({ origin: 'https://interval.so' }));
	await new Controller().index(context);
	assert.equal(context.response.getStatus(), 200, String(context.response.getBody()));
	const options = JSON.parse(context.response.getBody() as string) as { user: { name: string; displayName: string } };
	assert.equal(options.user.name, 'Alice');
	assert.equal(options.user.displayName, 'Alice');
	const cookies = context.response.getHeader('set-cookie') as string[];
	assert(cookies.some((cookie) => cookie.includes('better-auth-passkey')));
});
