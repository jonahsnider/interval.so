import redis from '@adonisjs/redis/services/main';
import type { Session } from '@adonisjs/session';
import { convert } from 'convert';

export type AuthChallengePurpose = 'register' | 'login' | 'deleteAccount' | 'revokeOtherSessions';

export class AuthChallengeService {
	private static readonly CHALLENGE_LIFETIME = convert(5, 'minutes');

	private static getRedisKey(session: Pick<Session, 'sessionId'>): string {
		return `authChallenge:${session.sessionId}`;
	}

	async storeChallenge(session: Session, challenge: string, purpose: AuthChallengePurpose): Promise<void> {
		// Persist anonymous sessions so their ID stays stable across the ceremony.
		session.put('authChallenge', true);
		await redis.set(
			AuthChallengeService.getRedisKey(session),
			JSON.stringify({ challenge, purpose }),
			'EX',
			AuthChallengeService.CHALLENGE_LIFETIME.to('s'),
		);
	}

	async consumeChallenge(session: Session, purpose: AuthChallengePurpose): Promise<string | undefined> {
		const result = await redis.getdel(AuthChallengeService.getRedisKey(session));
		session.forget('authChallenge');

		if (!result) {
			return undefined;
		}

		const stored: { challenge: string; purpose: AuthChallengePurpose } = JSON.parse(result);
		return stored.purpose === purpose ? stored.challenge : undefined;
	}
}
