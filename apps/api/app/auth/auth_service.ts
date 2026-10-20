import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import type { Session } from '@adonisjs/session';
import type { AuthenticationResponseJSON, AuthenticatorTransport } from '@simplewebauthn/server';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { origin, rpId } from '#config/auth';
import * as Schema from '#database/schema';
import { injectHelper } from '../../util/inject_helper.ts';
import { db } from '../db/db_service.ts';
import { AuthChallengeService, type AuthChallengePurpose } from './auth_challenge/auth_challenge_service.ts';

/** Verifies a new, account-bound passkey assertion for a specific sensitive action. */
@inject()
@injectHelper(AuthChallengeService)
export class AuthService {
	constructor(private readonly authChallengeService: AuthChallengeService) {}

	async getReauthenticationOptions(session: Session, userId: string, purpose: AuthChallengePurpose) {
		const passkeys = await db.query.credentials.findMany({
			where: { userId },
			columns: { credentialId: true },
		});
		if (passkeys.length === 0) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No passkey found for your account.' });
		}

		const options = await generateAuthenticationOptions({
			rpID: rpId,
			userVerification: 'required',
			allowCredentials: passkeys.map((passkey) => ({ id: passkey.credentialId })),
		});
		await this.authChallengeService.storeChallenge(session, options.challenge, purpose);
		return options;
	}

	async verifyReauthentication(input: {
		body: AuthenticationResponseJSON;
		session: Session;
		userId: string;
		purpose: AuthChallengePurpose;
	}): Promise<void> {
		await this.verifyAuthentication({ ...input, expectedUserId: input.userId });
	}

	private async verifyAuthentication(input: {
		body: AuthenticationResponseJSON;
		session: Session;
		purpose: AuthChallengePurpose;
		expectedUserId?: string;
	}) {
		const passkey = await db.query.credentials.findFirst({
			where: { credentialId: input.body.id },
			columns: {
				userId: true,
				credentialId: true,
				publicKey: true,
				counter: true,
				transports: true,
			},
		});

		if (!passkey) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: "That passkey wasn't recognized" });
		}

		if (input.expectedUserId && passkey.userId !== input.expectedUserId) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Use a passkey belonging to your signed-in account.' });
		}

		const currentChallenge = await this.authChallengeService.consumeChallenge(input.session, input.purpose);

		if (!currentChallenge) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'No challenge found for the given session. Try signing in again?',
			});
		}

		const verification = await verifyAuthenticationResponse({
			response: input.body,
			expectedChallenge: currentChallenge,
			expectedRPID: rpId,
			expectedOrigin: origin,
			credential: {
				id: passkey.credentialId,
				publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')),
				counter: passkey.counter,
				transports: passkey.transports.split(',').filter(Boolean) as AuthenticatorTransport[],
			},
			requireUserVerification: true,
		}).catch(() => {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Passkey verification failed.' });
		});

		if (!verification.verified) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Authentication failed',
			});
		}

		await db
			.update(Schema.credentials)
			.set({
				counter: verification.authenticationInfo.newCounter,
			})
			.where(eq(Schema.credentials.credentialId, passkey.credentialId));

		assert(passkey.userId, new TypeError('Credential from passkey was not associated with a user'));

		return passkey;
	}
}
