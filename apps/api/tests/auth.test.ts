import 'reflect-metadata';
import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { mock, test } from 'node:test';
import { AppFactory } from '@adonisjs/core/factories/app';
import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { Emitter } from '@adonisjs/core/events';
import type { ContainerBindings } from '@adonisjs/core/types';
import { defineConfig, Session, SessionCollection } from '@adonisjs/session';
import type { ResolvedSessionConfig } from '@adonisjs/session/types';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import type { Observable } from '@trpc/server/observable';
import { Subject } from 'rxjs';
import { AuthSessionService } from '../app/auth/auth_session_service.ts';

const app = new AppFactory<ContainerBindings>().create(new URL('../', import.meta.url));
const config: ResolvedSessionConfig = await defineConfig({
	store: 'memory',
	stores: {},
	age: '30 days',
	renewMissingSessionId: true,
	cookie: {},
}).resolver(app);
const sessions = new SessionCollection(config);
const authSessions = new AuthSessionService(sessions);

async function createSession(sessionId?: string) {
	const factory = config.stores.memory!;
	const context = new HttpContextFactory().create();
	if (sessionId) mock.method(context.request, 'cookie', () => sessionId);
	const session = new Session(config, factory, new Emitter(app), context);
	await session.initiate(false);
	return session;
}

await test('authentication expires at 90 days even with recent session activity', async () => {
	const session = await createSession();
	await authSessions.start(session, randomUUID());
	const authenticatedAt = session.get('authenticatedAt') as number;
	assert.equal(
		AuthSessionService.hasValidAuthentication(session.all(), authenticatedAt + AuthSessionService.MAX_AGE - 1),
		true,
	);
	session.put('timezone', 'UTC');
	assert.equal(
		AuthSessionService.hasValidAuthentication(session.all(), authenticatedAt + AuthSessionService.MAX_AGE),
		false,
	);
	assert.equal(session.get('authenticatedAt'), authenticatedAt);
});

await test('missing, invalid and future authentication timestamps are rejected', () => {
	assert.equal(AuthSessionService.hasValidAuthentication({}), false);
	for (const authenticatedAt of ['123', NaN, Infinity, Date.now() + 60_000]) {
		assert.equal(AuthSessionService.hasValidAuthentication({ authenticatedAt }), false);
	}
});

await test('expired and existing sessions lose authentication; guest sessions remain usable', async () => {
	for (const authenticatedAt of [undefined, Date.now() - AuthSessionService.MAX_AGE]) {
		const session = await createSession();
		session.put('userId', randomUUID());
		if (authenticatedAt !== undefined) session.put('authenticatedAt', authenticatedAt);
		const oldId = session.sessionId;
		AuthSessionService.expire(session);
		assert.equal(session.has('userId'), false);
		assert.notEqual(session.sessionId, oldId);
	}
	const guest = await createSession();
	guest.put('guestToken', 'guest-token');
	AuthSessionService.expire(guest);
	assert.equal(guest.get('guestToken'), 'guest-token');
});

await test('starting an authenticated session rotates the ID and tags it for revocation', async () => {
	const anonymousSession = await createSession();
	anonymousSession.put('timezone', 'UTC');
	await anonymousSession.commit();
	const oldId = anonymousSession.sessionId;
	const session = await createSession(oldId);
	const userId = randomUUID();
	await authSessions.start(session, userId);
	await session.commit();
	assert.notEqual(session.sessionId, oldId);
	assert.equal(await sessions.get(oldId), null);
	assert.equal((await sessions.tagged(userId))[0]?.id, session.sessionId);
	assert.equal(session.get('timezone'), 'UTC');
	await authSessions.assertActive(session);
});

await test('revoking other devices preserves the current session and other users', async () => {
	const userId = randomUUID();
	const current = await createSession();
	const otherDevice = await createSession();
	const otherUser = await createSession();
	for (const session of [current, otherDevice, otherUser]) {
		await authSessions.start(session, session === otherUser ? randomUUID() : userId);
		await session.commit();
	}
	await authSessions.revokeSessions(userId, current.sessionId);
	await authSessions.assertActive(current);
	await authSessions.assertActive(otherUser);
	await assert.rejects(authSessions.assertActive(otherDevice), { code: 'UNAUTHORIZED' });
	await authSessions.revokeSessions(userId);
	await assert.rejects(authSessions.assertActive(current), { code: 'UNAUTHORIZED' });
});

const challenges = new Map<string, string>();
mock.module('@adonisjs/redis/services/main', {
	defaultExport: {
		set: async (key: string, value: string) => challenges.set(key, value),
		getdel: async (key: string) => {
			const value = challenges.get(key);
			challenges.delete(key);
			return value ?? null;
		},
	},
});
mock.module('#config/auth', {
	namedExports: { rpId: 'interval.so', rpName: 'interval.so', origin: 'https://interval.so' },
});
mock.module(new URL('../app/analytics/analytics_service.ts', import.meta.url).href, {
	namedExports: { ph: { capture() {}, identify() {} } },
});

const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const jwk = publicKey.export({ format: 'jwk' });
const credential = {
	credentialId: Buffer.from('test-credential').toString('base64url'),
	userId: randomUUID(),
	publicKey: Buffer.from(
		isoCBOR.encode(
			new Map<number, number | Uint8Array>([
				[1, 2],
				[3, -7],
				[-1, 1],
				[-2, Buffer.from(jwk.x!, 'base64url')],
				[-3, Buffer.from(jwk.y!, 'base64url')],
			]),
		),
	),
	counter: 0,
	transports: [],
	user: { displayName: 'Test user' },
};
mock.module(new URL('../app/db/db_service.ts', import.meta.url).href, {
	namedExports: {
		db: {
			query: { credentials: { findFirst: async () => credential, findMany: async () => [credential] } },
			update: () => ({ set: () => ({ where: async () => {} }) }),
		},
	},
});

const { AuthChallengeService } = await import('../app/auth/auth_challenge/auth_challenge_service.ts');
const { AuthService } = await import('../app/auth/auth_service.ts');
const authChallenges = new AuthChallengeService();
const auth = new AuthService(authChallenges, authSessions);

function assertion(challenge: string, userVerified = true): AuthenticationResponseJSON {
	const clientDataJSON = Buffer.from(
		JSON.stringify({ type: 'webauthn.get', challenge, origin: 'https://interval.so' }),
	);
	const authenticatorData = Buffer.concat([
		createHash('sha256').update('interval.so').digest(),
		Buffer.from([userVerified ? 5 : 1, 0, 0, 0, 0]),
	]);
	const signature = sign(
		'sha256',
		Buffer.concat([authenticatorData, createHash('sha256').update(clientDataJSON).digest()]),
		privateKey,
	);
	return {
		id: credential.credentialId,
		rawId: credential.credentialId,
		type: 'public-key',
		clientExtensionResults: {},
		response: {
			clientDataJSON: clientDataJSON.toString('base64url'),
			authenticatorData: authenticatorData.toString('base64url'),
			signature: signature.toString('base64url'),
		},
	};
}

await test('challenges can be consumed only once and only for the requested action', async () => {
	const session = await createSession();
	await authChallenges.storeChallenge(session, 'challenge', 'deleteAccount');
	assert.equal(session.has('authChallenge'), true);
	assert.equal(await authChallenges.consumeChallenge(session, 'revokeOtherSessions'), undefined);
	assert.equal(await authChallenges.consumeChallenge(session, 'deleteAccount'), undefined);
	await authChallenges.storeChallenge(session, 'challenge', 'deleteAccount');
	assert.equal(await authChallenges.consumeChallenge(session, 'deleteAccount'), 'challenge');
	assert.equal(await authChallenges.consumeChallenge(session, 'deleteAccount'), undefined);
});

await test('sensitive actions accept a verified passkey belonging to the current user', async () => {
	const session = await createSession();
	await authSessions.start(session, credential.userId);
	const options = await auth.getReauthenticationOptions(session, credential.userId, 'deleteAccount');
	assert.deepEqual(
		options.allowCredentials?.map((item) => item.id),
		[credential.credentialId],
	);
	const input = {
		session,
		userId: credential.userId,
		purpose: 'deleteAccount' as const,
		body: assertion(options.challenge),
	};
	await auth.verifyReauthentication(input);
	await assert.rejects(auth.verifyReauthentication(input), { code: 'UNAUTHORIZED' });
});

await test('another account cannot use its own passkey to authorize a sensitive action', async () => {
	const session = await createSession();
	const userId = randomUUID();
	await authSessions.start(session, userId);
	await authChallenges.storeChallenge(session, 'challenge', 'deleteAccount');
	await assert.rejects(
		auth.verifyReauthentication({
			session,
			userId,
			purpose: 'deleteAccount',
			body: assertion('challenge'),
		}),
		{ code: 'UNAUTHORIZED' },
	);
});

await test('login responses cannot authorize deletion, and user verification is required', async () => {
	const session = await createSession();
	await authChallenges.storeChallenge(session, 'challenge', 'login');
	await assert.rejects(
		auth.verifyReauthentication({
			session,
			userId: credential.userId,
			purpose: 'deleteAccount',
			body: assertion('challenge'),
		}),
		{ code: 'UNAUTHORIZED' },
	);
	await authChallenges.storeChallenge(session, 'challenge', 'deleteAccount');
	await assert.rejects(
		auth.verifyReauthentication({
			session,
			userId: credential.userId,
			purpose: 'deleteAccount',
			body: assertion('challenge', false),
		}),
		/verification/i,
	);
});

await test('open subscriptions stop delivering data after their session is revoked', async () => {
	const { publicProcedure, router } = await import('../app/trpc/trpc_service.ts');
	const session = await createSession();
	await authSessions.start(session, randomUUID());
	await session.commit();
	const source = new Subject<number>();
	const caller = router({
		events: publicProcedure.subscription((): Observable<number, unknown> => source),
	}).createCaller({
		session,
		bouncer: {} as never,
		validateSession: () => authSessions.assertActive(session),
	});
	const subscription = await caller.events();
	const received: number[] = [];
	const ended = new Promise<unknown>((resolve) => {
		subscription.subscribe({ next: (value) => received.push(value), error: resolve });
	});
	source.next(1);
	await new Promise((resolve) => setImmediate(resolve));
	assert.deepEqual(received, [1]);
	await sessions.destroy(session.sessionId);
	source.next(2);
	const error = await ended;
	assert.equal((error as { code: string }).code, 'UNAUTHORIZED');
	assert.deepEqual(received, [1]);
});
