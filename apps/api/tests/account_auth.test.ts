import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { test } from 'node:test';
import { memoryAdapter } from 'better-auth/adapters/memory';
import type {
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import type { AccountSession } from '../app/auth/create_account_auth.ts';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import { createAccountAuth, ACCOUNT_MAX_AGE, isActiveAccountSession } from '../app/auth/create_account_auth.ts';

const origin = 'https://interval.so';
const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const jwk = publicKey.export({ format: 'jwk' });
const coseKey = Buffer.from(
	isoCBOR.encode(
		new Map<number, number | Uint8Array>([
			[1, 2],
			[3, -7],
			[-1, 1],
			[-2, Buffer.from(jwk.x!, 'base64url')],
			[-3, Buffer.from(jwk.y!, 'base64url')],
		]),
	),
);

function ceremony(challenge: string, credentialId: string, register = false, verified = true) {
	const clientDataJSON = Buffer.from(
		JSON.stringify({ type: register ? 'webauthn.create' : 'webauthn.get', challenge, origin }),
	);
	const credential = Buffer.from(credentialId, 'base64url');
	const length = Buffer.alloc(2);
	length.writeUInt16BE(credential.length);
	const authenticatorData = Buffer.concat([
		createHash('sha256').update('interval.so').digest(),
		Buffer.from([(verified ? 5 : 1) | (register ? 64 : 0), 0, 0, 0, 0]),
		...(register ? [Buffer.alloc(16), length, credential, coseKey] : []),
	]);
	return {
		id: credentialId,
		rawId: credentialId,
		type: 'public-key',
		clientExtensionResults: {},
		response: register
			? {
					clientDataJSON: clientDataJSON.toString('base64url'),
					attestationObject: Buffer.from(
						isoCBOR.encode(
							new Map<string, string | Map<string, never> | Uint8Array>([
								['fmt', 'none'],
								['attStmt', new Map<string, never>()],
								['authData', new Uint8Array(authenticatorData)],
							]),
						),
					).toString('base64url'),
					transports: ['internal'],
				}
			: {
					clientDataJSON: clientDataJSON.toString('base64url'),
					authenticatorData: authenticatorData.toString('base64url'),
					signature: sign(
						'sha256',
						Buffer.concat([authenticatorData, createHash('sha256').update(clientDataJSON).digest()]),
						privateKey,
					).toString('base64url'),
				},
	};
}

function fixture() {
	const data: Record<string, Record<string, unknown>[]> = { user: [], passkey: [], session: [], verification: [] };
	const auth = createAccountAuth({
		database: memoryAdapter(data),
		secret: randomBytes(32).toString('hex'),
		baseURL: 'https://api.interval.so',
		origin,
		rpId: 'interval.so',
		cookieDomain: 'interval.so',
	});
	const cookies = new Map<string, string>();
	async function request(path: string, body?: unknown) {
		const response = await auth.handler(
			new Request(`https://api.interval.so/api/auth${path}`, {
				method: body === undefined ? 'GET' : 'POST',
				headers: {
					origin,
					'content-type': 'application/json',
					cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
				},
				body: body === undefined ? undefined : JSON.stringify(body),
			}),
		);
		for (const cookie of response.headers.getSetCookie()) {
			const [entry] = cookie.split(';');
			const index = entry!.indexOf('=');
			cookies.set(entry!.slice(0, index), entry!.slice(index + 1));
		}
		return response;
	}
	return { auth, data, cookies, request };
}

await test('passkey-first signup creates an email-free identity only after verification and sets shared cookies', async () => {
	const { request, data } = fixture();
	const options = (await (
		await request('/passkey/generate-register-options?context=Alice')
	).json()) as PublicKeyCredentialCreationOptionsJSON;
	assert.equal(options.user.name, 'Alice');
	assert.equal(options.user.displayName, 'Alice');
	assert.equal(options.authenticatorSelection?.residentKey, 'required');
	assert.equal(options.authenticatorSelection?.userVerification, 'required');
	assert.equal(data.user!.length, 0);
	const registration = {
		response: ceremony(options.challenge, randomBytes(32).toString('base64url'), true),
		createSession: true,
	};
	const response = await request('/passkey/verify-registration', registration);
	const body = (await response.json()) as { user: { name: string; email?: string } };
	assert.equal(response.status, 200, JSON.stringify(body));
	assert.equal(data.user!.length, 1);
	const user = data.user![0]!;
	assert.equal(user.email, `${String(user.id)}@users.invalid`);
	assert.equal(user.emailVerified, false);
	assert.equal(body.user.name, 'Alice');
	assert.equal(body.user.email, undefined);
	assert(
		response.headers
			.getSetCookie()
			.some((cookie) => /Domain=interval.so/i.test(cookie) && /HttpOnly/i.test(cookie) && /Secure/i.test(cookie)),
	);
	const session = (await (await request('/get-session')).json()) as AccountSession;
	assert.equal(session.user.id, user.id);
	assert.equal(session.user.email, undefined);
	const additional = (await (
		await request('/passkey/generate-register-options')
	).json()) as PublicKeyCredentialCreationOptionsJSON;
	assert.equal(additional.user.name, 'Alice');
	assert.equal(additional.user.displayName, 'Alice');
});

await test('a migrated public key authenticates its existing UUID; replay and missing user verification fail', async () => {
	const { request, data, auth } = fixture();
	const id = randomUUID();
	const credentialId = randomBytes(32).toString('base64url');
	const context = await auth.$context;
	await context.internalAdapter.createUser(
		{ id, name: 'Existing user', email: `${id}@users.invalid`, emailVerified: false },
		{ method: 'passkey' },
	);
	await context.adapter.create({
		model: 'passkey',
		data: {
			userId: id,
			credentialID: credentialId,
			publicKey: coseKey.toString('base64'),
			counter: 0,
			deviceType: 'multiDevice',
			backedUp: false,
			transports: 'internal',
		},
	});
	const options = (await (
		await request('/passkey/generate-authenticate-options')
	).json()) as PublicKeyCredentialRequestOptionsJSON;
	const body = { response: ceremony(options.challenge, credentialId) };
	const response = await request('/passkey/verify-authentication', body);
	assert.equal(response.status, 200, await response.clone().text());
	assert.equal(((await response.json()) as AccountSession).user.id, id);
	assert.equal((await request('/passkey/verify-authentication', body)).status, 400);
	const options2 = (await (
		await request('/passkey/generate-authenticate-options')
	).json()) as PublicKeyCredentialRequestOptionsJSON;
	assert.equal(
		(
			await request('/passkey/verify-authentication', {
				response: ceremony(options2.challenge, credentialId, false, false),
			})
		).status,
		401,
	);
	assert.equal(data.user!.length, 1);
});

await test('failed user verification creates neither an account nor a passkey', async () => {
	const { request, data } = fixture();
	const options = (await (
		await request('/passkey/generate-register-options?context=Alice')
	).json()) as PublicKeyCredentialCreationOptionsJSON;
	const response = await request('/passkey/verify-registration', {
		response: ceremony(options.challenge, randomBytes(32).toString('base64url'), true, false),
		createSession: true,
	});
	assert.equal(response.status, 401);
	assert.equal(data.user!.length, 0);
	assert.equal(data.passkey!.length, 0);
});

await test('email authentication is disabled and account authentication has a 90-day absolute limit', async () => {
	const { auth, request } = fixture();
	assert.notEqual(
		(await request('/sign-up/email', { email: 'someone@example.com', password: 'password123', name: 'Someone' }))
			.status,
		200,
	);
	const ctx = await auth.$context;
	const id = randomUUID();
	const user = await ctx.internalAdapter.createUser(
		{ id, name: 'Alice', email: `${id}@users.invalid`, emailVerified: false },
		{ method: 'passkey' },
	);
	const session = await ctx.internalAdapter.createSession(id);
	assert(session);
	const account = { user, session };
	assert.equal(isActiveAccountSession(account), true);
	assert.equal(
		isActiveAccountSession({
			session: {
				...session,
				createdAt: new Date(Date.now() - ACCOUNT_MAX_AGE),
				expiresAt: new Date(Date.now() + 60_000),
			},
		}),
		false,
	);
	assert.equal(isActiveAccountSession({ session: { ...session, createdAt: new Date(Date.now() + 60_000) } }), false);
});
