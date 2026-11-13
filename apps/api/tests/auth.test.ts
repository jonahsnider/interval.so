import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { mock, test } from 'node:test';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import type { AccountSession } from '../app/auth/create_account_auth.ts';

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
	namedExports: { rpId: 'interval.so', origin: 'https://interval.so' },
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
};
mock.module(new URL('../app/db/db_service.ts', import.meta.url).href, {
	namedExports: {
		db: {
			query: { credentials: { findFirst: async () => credential, findMany: async () => [credential] } },
			update: () => ({ set: () => ({ where: async () => {} }) }),
		},
	},
});

const { AuthService } = await import('../app/auth/auth_service.ts');
const auth = new AuthService();

function account(userId = credential.userId) {
	return { user: { id: userId, name: 'Test user' }, session: { id: randomUUID() } } as unknown as AccountSession;
}

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

await test('sensitive actions accept a verified passkey belonging to the current user, once', async () => {
	const current = account();
	const options = await auth.getReauthenticationOptions(current, 'deleteAccount');
	assert.deepEqual(
		options.allowCredentials?.map((item) => item.id),
		[credential.credentialId],
	);
	const input = { account: current, purpose: 'deleteAccount' as const, body: assertion(options.challenge) };
	await auth.verifyReauthentication(input);
	await assert.rejects(auth.verifyReauthentication(input), { code: 'UNAUTHORIZED' });
});

await test('another account cannot use its own passkey to authorize a sensitive action', async () => {
	const other = account(randomUUID());
	const options = await auth.getReauthenticationOptions(other, 'deleteAccount');
	await assert.rejects(
		auth.verifyReauthentication({ account: other, purpose: 'deleteAccount', body: assertion(options.challenge) }),
		{ code: 'UNAUTHORIZED' },
	);
});

await test('challenges are bound to their account session', async () => {
	const options = await auth.getReauthenticationOptions(account(), 'deleteAccount');
	await assert.rejects(
		auth.verifyReauthentication({ account: account(), purpose: 'deleteAccount', body: assertion(options.challenge) }),
		{ code: 'UNAUTHORIZED' },
	);
});

await test('responses for another action cannot authorize deletion, and user verification is required', async () => {
	const current = account();
	let options = await auth.getReauthenticationOptions(current, 'revokeOtherSessions');
	const body = assertion(options.challenge);
	await assert.rejects(auth.verifyReauthentication({ account: current, purpose: 'deleteAccount', body }), {
		code: 'UNAUTHORIZED',
	});
	// The mismatched attempt consumed the challenge.
	await assert.rejects(auth.verifyReauthentication({ account: current, purpose: 'revokeOtherSessions', body }), {
		code: 'UNAUTHORIZED',
	});

	options = await auth.getReauthenticationOptions(current, 'deleteAccount');
	await assert.rejects(
		auth.verifyReauthentication({
			account: current,
			purpose: 'deleteAccount',
			body: assertion(options.challenge, false),
		}),
		{ code: 'UNAUTHORIZED' },
	);
});
