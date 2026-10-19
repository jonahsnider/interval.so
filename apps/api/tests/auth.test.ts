import 'reflect-metadata';
import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { mock, test } from 'node:test';
import { AppFactory } from '@adonisjs/core/factories/app';
import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { Emitter } from '@adonisjs/core/events';
import type { ContainerBindings } from '@adonisjs/core/types';
import { defineConfig, Session } from '@adonisjs/session';
import type { ResolvedSessionConfig } from '@adonisjs/session/types';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { isoCBOR } from '@simplewebauthn/server/helpers';

const app = new AppFactory<ContainerBindings>().create(new URL('../', import.meta.url));
const config: ResolvedSessionConfig = await defineConfig({
	store: 'memory',
	stores: {},
	age: '30 days',
	renewMissingSessionId: true,
	cookie: {},
}).resolver(app);

async function createSession(sessionId?: string) {
	const factory = config.stores.memory!;
	const context = new HttpContextFactory().create();
	if (sessionId) mock.method(context.request, 'cookie', () => sessionId);
	const session = new Session(config, factory, new Emitter(app), context);
	await session.initiate(false);
	return session;
}

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
	).toString('base64'),
	counter: 0,
	transports: '',
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
const auth = new AuthService(authChallenges);

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

await test('responses for another action cannot authorize deletion, and user verification is required', async () => {
	const session = await createSession();
	await authChallenges.storeChallenge(session, 'challenge', 'revokeOtherSessions');
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
		{ code: 'UNAUTHORIZED' },
	);
});
