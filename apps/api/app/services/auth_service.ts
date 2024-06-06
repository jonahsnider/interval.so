import assert from 'node:assert';
import { inject } from '@adonisjs/core';
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { origin, rpId, rpName } from '#config/auth';
import * as Schema from '#database/schema';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthChallengeService } from './auth_challenge_service.js';
import { db } from './db.js';

@inject()
@injectHelper(AuthChallengeService)
export class AuthService {
	constructor(private readonly authChallengeService: AuthChallengeService) {}

	async getRegisterOptions(input: {
		displayName: string;
		sessionId: string;
	}): Promise<PublicKeyCredentialCreationOptionsJSON> {
		const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
			rpName: rpName,
			// biome-ignore lint/style/useNamingConvention: This can't be renamed
			rpID: rpId,
			userName: input.sessionId,
			userDisplayName: input.displayName,
			// Don't prompt users for additional information about the authenticator
			// (Recommended for smoother UX)
			attestationType: 'none',
			// An authenticator is a new account, so we don't exclude any credentials
			excludeCredentials: [],
			// See "Guiding use of authenticators via authenticatorSelection" below
			authenticatorSelection: {
				// Resident key required per https://simplewebauthn.dev/docs/advanced/passkeys#generateregistrationoptions
				residentKey: 'required',
				userVerification: 'preferred',
			},
		});

		return options;
	}

	async verifyRegister(input: {
		body: RegistrationResponseJSON;
		sessionId: string;
		displayName: string;
	}): Promise<boolean> {
		const existingChallenge = await this.authChallengeService.getAndDeleteChallenge(input.sessionId);

		if (!existingChallenge) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'No challenge found for the given session. Try signing up again?',
			});
		}

		// TODO: If this throws, send a 400 for failing the challenge
		const verification = await verifyRegistrationResponse({
			response: input.body,
			expectedChallenge: existingChallenge,
			expectedOrigin: origin,
			// biome-ignore lint/style/useNamingConvention: This can't be renamed
			expectedRPID: rpId,
			requireUserVerification: true,
		});

		if (verification.verified) {
			await db.transaction(async (tx) => {
				assert(
					verification.registrationInfo,
					new TypeError('Expected registration info to be defined since verification was successful'),
				);

				const [user] = await tx
					.insert(Schema.users)
					.values({
						displayName: input.displayName,
					})
					.returning({ id: Schema.users.id });

				await tx.insert(Schema.credentials).values({
					userId: user.id,
					deviceType: verification.registrationInfo.credentialDeviceType,
					id: verification.registrationInfo.credentialID,
					publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey),
					webauthnUserId: verification.registrationInfo.aaguid,
					backedUp: verification.registrationInfo.credentialBackedUp,
					counter: verification.registrationInfo.counter,
					transports: input.body.response.transports,
				});
			});
		}

		return verification.verified;
	}

	async getLoginOptions(sessionId: string) {
		const options = await generateAuthenticationOptions({
			// biome-ignore lint/style/useNamingConvention: This can't be renamed
			rpID: rpId,
			userVerification: 'preferred',
			// Empty array allows users to auth with any passkeys they have available
			allowCredentials: [],
		});

		// Persist challenge
		await this.authChallengeService.setChallenge(sessionId, options.challenge);

		return options;
	}

	async verifyLogin(body: AuthenticationResponseJSON, sessionId: string) {
		const passkey = await db.query.credentials.findFirst({
			where: eq(Schema.credentials.id, body.id),
		});

		if (!passkey) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: "That passkey wasn't recognized" });
		}

		const currentChallenge = await this.authChallengeService.getAndDeleteChallenge(sessionId);

		if (!currentChallenge) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'No challenge found for the given session. Try signing in again?',
			});
		}

		// TODO: If this throws, send a 400 for failing the challenge
		const verification = await verifyAuthenticationResponse({
			response: body,
			expectedChallenge: currentChallenge,
			// biome-ignore lint/style/useNamingConvention: This can't be renamed
			expectedRPID: rpId,
			expectedOrigin: origin,
			authenticator: {
				// biome-ignore lint/style/useNamingConvention: This can't be renamed
				credentialID: passkey.id,
				credentialPublicKey: passkey.publicKey,
				counter: passkey.counter,
				transports: passkey.transports as AuthenticatorTransport[],
			},
			requireUserVerification: true,
		});

		if (verification.verified) {
			await db
				.update(Schema.credentials)
				.set({
					counter: verification.authenticationInfo.newCounter,
				})
				.where(eq(Schema.credentials.id, passkey.id));
		}

    // TODO: Persist session in cookies or something
	}
}
