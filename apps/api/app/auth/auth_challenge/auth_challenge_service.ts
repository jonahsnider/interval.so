import redis from '@adonisjs/redis/services/main';
import type { Session } from '@adonisjs/session';
import { convert } from 'convert';

export class AuthChallengeService {
	private static readonly CHALLENGE_LIFETIME = convert(5, 'minutes');

	private static getRedisKey(session: Pick<Session, 'sessionId'>): string {
		return `authChallenge:${session.sessionId}`;
	}

	async storeChallenge(session: Pick<Session, 'sessionId'>, challenge: string): Promise<void> {
		await redis.set(
			AuthChallengeService.getRedisKey(session),
			challenge,
			'EX',
			AuthChallengeService.CHALLENGE_LIFETIME.to('s'),
		);
	}

	async consumeChallenge(session: Pick<Session, 'sessionId'>): Promise<string | undefined> {
		const result = await redis.get(AuthChallengeService.getRedisKey(session));

		return result ?? undefined;
	}
}
