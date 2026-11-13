import redis from '@adonisjs/redis/services/main';
import type { AuthenticationResponseJSON, AuthenticatorTransport } from '@simplewebauthn/server';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { TRPCError } from '@trpc/server';
import { convert } from 'convert';
import { eq } from 'drizzle-orm';
import { origin, rpId } from '#config/auth';
import * as Schema from '#database/schema';
import { db } from '../db/db_service.ts';
import type { AccountSession } from './create_account_auth.ts';

export type ReauthenticationPurpose = 'deleteAccount' | 'revokeOtherSessions';

type Account = Pick<AccountSession, 'user' | 'session'>;

const CHALLENGE_LIFETIME = convert(5, 'minutes');

function challengeKey(account: Account): string {
	return `authChallenge:${account.session.id}`;
}

/** Verifies a new, account-bound passkey assertion for a specific sensitive action. */
export class AuthService {
	async getReauthenticationOptions(account: Account, purpose: ReauthenticationPurpose) {
		const passkeys = await db.query.credentials.findMany({
			where: { userId: account.user.id },
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
		await this.storeChallenge(account, options.challenge, purpose);
		return options;
	}

	async verifyReauthentication(input: {
		body: AuthenticationResponseJSON;
		account: Account;
		purpose: ReauthenticationPurpose;
	}): Promise<void> {
		const passkey = await db.query.credentials.findFirst({
			where: { credentialId: input.body.id },
			columns: { userId: true, credentialId: true, publicKey: true, counter: true, transports: true },
		});

		if (!passkey) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: "That passkey wasn't recognized" });
		}

		if (passkey.userId !== input.account.user.id) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Use a passkey belonging to your signed-in account.' });
		}

		const challenge = await this.consumeChallenge(input.account, input.purpose);

		if (!challenge) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No challenge found for this action. Please try again.' });
		}

		const verification = await verifyAuthenticationResponse({
			response: input.body,
			expectedChallenge: challenge,
			expectedRPID: rpId,
			expectedOrigin: origin,
			credential: {
				id: passkey.credentialId,
				publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')),
				counter: passkey.counter,
				transports: passkey.transports.split(',').filter(Boolean) as AuthenticatorTransport[],
			},
			requireUserVerification: true,
		}).catch(() => undefined);

		if (!verification?.verified) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Passkey verification failed.' });
		}

		await db
			.update(Schema.credentials)
			.set({ counter: verification.authenticationInfo.newCounter })
			.where(eq(Schema.credentials.credentialId, passkey.credentialId));
	}

	private async storeChallenge(account: Account, challenge: string, purpose: ReauthenticationPurpose): Promise<void> {
		await redis.set(challengeKey(account), JSON.stringify({ challenge, purpose }), 'EX', CHALLENGE_LIFETIME.to('s'));
	}

	/** Consumes the account session's challenge, returning it only if it was issued for the given purpose. */
	private async consumeChallenge(account: Account, purpose: ReauthenticationPurpose): Promise<string | undefined> {
		const result = await redis.getdel(challengeKey(account));

		if (!result) {
			return undefined;
		}

		const stored: { challenge: string; purpose: ReauthenticationPurpose } = JSON.parse(result);
		return stored.purpose === purpose ? stored.challenge : undefined;
	}
}
