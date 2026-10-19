import { randomUUID } from 'node:crypto';
import { passkey } from '@better-auth/passkey';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import { betterAuth, type BetterAuthOptions, type Session, type User } from 'better-auth';
import { APIError, createAuthEndpoint, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import { z } from 'zod';
import { UserSchema } from '../user/schemas/user_schema.ts';

export const ACCOUNT_MAX_AGE = 90 * 24 * 60 * 60 * 1000;

export function createAccountAuth(options: {
	database: BetterAuthOptions['database'];
	secondaryStorage?: BetterAuthOptions['secondaryStorage'];
	secret: string;
	baseURL: string;
	origin: string;
	rpId: string;
	cookieDomain?: string;
	onSignup?: (user: { id: string; name: string }) => void;
	onLogin?: (userId: string) => void;
}) {
	return betterAuth({
		appName: 'Interval',
		baseURL: options.baseURL,
		secret: options.secret,
		database: options.database,
		secondaryStorage: options.secondaryStorage,
		trustedOrigins: [options.origin],
		emailAndPassword: { enabled: false },
		user: { fields: { name: 'displayName' }, changeEmail: { enabled: false } },
		account: { accountLinking: { enabled: false } },
		session: {
			expiresIn: 30 * 24 * 60 * 60,
			cookieCache: { enabled: false },
		},
		verification: { storeInDatabase: true },
		advanced: {
			// Railway's public edge supplies the client IP here; X-Forwarded-For can contain multiple hops.
			ipAddress: { ipAddressHeaders: ['x-real-ip'] },
			database: { generateId: 'uuid' },
			crossSubDomainCookies: options.cookieDomain ? { enabled: true, domain: options.cookieDomain } : undefined,
		},
		rateLimit: { enabled: true, storage: options.secondaryStorage ? 'secondary-storage' : 'memory' },
		plugins: [
			// Remove this server-only cookie handoff with the Adonis exchange, 90 days after the last old API stops issuing sessions.
			{
				id: 'adonis-session-migration',
				endpoints: {
					resumeAdonisSession: createAuthEndpoint.serverOnly(
						{ method: 'POST', body: z.object({ token: z.string() }) },
						async (ctx) => {
							const account = await ctx.context.internalAdapter.findSession(ctx.body.token);
							if (!account || !isActiveAccountSession(account)) return ctx.json(null);
							await setSessionCookie(ctx, account, false, {
								maxAge: Math.floor((account.session.expiresAt.getTime() - Date.now()) / 1000),
							});
							return ctx.json(account);
						},
					),
				},
			},
			passkey({
				rpID: options.rpId,
				rpName: 'interval.so',
				origin: options.origin,
				authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
				schema: { passkey: { fields: { credentialID: 'credentialId' } } },
				registration: {
					requireSession: false,
					resolveUser: ({ context }) => {
						const result = UserSchema.shape.displayName.safeParse(context);
						if (!result.success) throw new APIError('BAD_REQUEST', { message: 'A display name is required.' });
						return { id: randomUUID(), name: result.data, displayName: result.data };
					},
					afterVerification: async ({ ctx, user, verification }) => {
						if (!verification.registrationInfo?.userVerified) {
							throw new APIError('UNAUTHORIZED', { message: 'Passkey user verification is required.' });
						}
						if (ctx.context.session) return;
						// The identity comes from the consumed server challenge, never a client-supplied ID.
						await ctx.context.internalAdapter.createUser(
							{
								id: user.id,
								name: user.name,
								email: `${user.id}@users.invalid`,
								emailVerified: false,
							},
							{ method: 'passkey' },
						);
						return { userId: user.id };
					},
				},
				authentication: {
					afterVerification: ({ verification }) => {
						if (!verification.authenticationInfo.userVerified) {
							throw new APIError('UNAUTHORIZED', { message: 'Passkey user verification is required.' });
						}
					},
				},
			}),
		],
		hooks: {
			before: createAuthMiddleware(async (ctx) => {
				if (ctx.path === '/passkey/generate-register-options' || ctx.path === '/passkey/verify-registration') {
					const session = await getSessionFromCtx(ctx);
					if (session && !isActiveAccountSession(session)) {
						throw new APIError('UNAUTHORIZED', { message: 'Your session has expired. Please sign in again.' });
					}
					if (ctx.path === '/passkey/verify-registration' && !session && ctx.body?.createSession !== true) {
						throw new APIError('BAD_REQUEST', { message: 'Signup must create an account session.' });
					}
				}
			}),
			after: createAuthMiddleware(async (ctx) => {
				if (ctx.path === '/passkey/generate-register-options' && ctx.context.session) {
					const result = ctx.context.returned as PublicKeyCredentialCreationOptionsJSON;
					if (result.user) {
						result.user.name = ctx.context.session.user.name;
						result.user.displayName = ctx.context.session.user.name;
						return ctx.json(result);
					}
				}
				const session = ctx.context.newSession;
				if (session && ctx.path === '/passkey/verify-registration' && !ctx.context.session)
					options.onSignup?.(session.user);
				if (session && ctx.path === '/passkey/verify-authentication') options.onLogin?.(session.user.id);
				const result = ctx.context.returned as { user: User; session: Session } | null;
				if (result instanceof APIError) return;
				if (ctx.path === '/get-session' && result && !isActiveAccountSession(result)) {
					await ctx.context.internalAdapter.deleteSession(result.session.token);
					return ctx.json(null);
				}
				if ((ctx.path === '/get-session' || session) && result?.user) {
					return ctx.json({ ...result, user: { id: result.user.id, name: result.user.name } });
				}
			}),
		},
	});
}

export type AccountAuth = ReturnType<typeof createAccountAuth>;
export type AccountSession = AccountAuth['$Infer']['Session'];

export function isActiveAccountSession(
	session: { session: Pick<Session, 'createdAt' | 'expiresAt'> },
	now = Date.now(),
): boolean {
	const createdAt = new Date(session.session.createdAt).getTime();
	return createdAt <= now && now - createdAt < ACCOUNT_MAX_AGE && new Date(session.session.expiresAt).getTime() > now;
}
