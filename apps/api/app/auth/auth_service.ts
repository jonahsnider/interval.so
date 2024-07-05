import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import type { Session } from '@adonisjs/session';
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
import { db } from '../db/db_service.js';
import { AuthChallengeService } from './auth_challenge/auth_challenge_service.js';

@inject()
@injectHelper(AuthChallengeService)
export class AuthService {
	constructor(private readonly authChallengeService: AuthChallengeService) {}

	async getRegisterOptions(input: {
		displayName: string;
		session: Session;
	}): Promise<PublicKeyCredentialCreationOptionsJSON> {
		const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
			rpName: rpName,
			// biome-ignore lint/style/useNamingConvention: This can't be renamed
			rpID: rpId,
			userName: input.displayName,
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

		// Store the challenge for later verification
		await this.authChallengeService.storeChallenge(input.session, options.challenge);

		return options;
	}

	async verifyRegister(input: {
		body: RegistrationResponseJSON;
		session: Session;
		displayName: string;
	}): Promise<void> {
		const existingChallenge = await this.authChallengeService.consumeChallenge(input.session);

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

		if (!verification.verified) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Authentication failed',
			});
		}

		let userId: string | undefined;

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

			assert(user);

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

			userId = user.id;
		});

		assert(userId, new TypeError('User was not created'));

		// Associate session with user
		input.session.put('userId', userId);
	}

	async getLoginOptions(session: Session) {
		const options = await generateAuthenticationOptions({
			// biome-ignore lint/style/useNamingConvention: This can't be renamed
			rpID: rpId,
			userVerification: 'preferred',
			// Empty array allows users to auth with any passkeys they have available
			allowCredentials: [],
		});

		// Persist challenge
		await this.authChallengeService.storeChallenge(session, options.challenge);

		return options;
	}

	async verifyLogin(input: {
		body: AuthenticationResponseJSON;
		session: Session;
	}) {
		const passkey = await db.query.credentials.findFirst({
			where: eq(Schema.credentials.id, input.body.id),
			columns: {
				userId: true,
				id: true,
				publicKey: true,
				counter: true,
				transports: true,
			},
			with: {
				user: {
					columns: {
						displayName: true,
					},
				},
			},
		});

		if (!passkey) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: "That passkey wasn't recognized" });
		}

		const currentChallenge = await this.authChallengeService.consumeChallenge(input.session);

		if (!currentChallenge) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'No challenge found for the given session. Try signing in again?',
			});
		}

		// TODO: If this throws, send a 400 for failing the challenge
		const verification = await verifyAuthenticationResponse({
			response: input.body,
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
			.where(eq(Schema.credentials.id, passkey.id));

		assert(passkey.userId, new TypeError('Credential from passkey was not associated with a user'));

		// Associate session with user
		input.session.put('userId', passkey.userId);

		return passkey.user;
	}
}
