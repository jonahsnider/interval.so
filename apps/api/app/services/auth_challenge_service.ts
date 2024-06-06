import type { HttpContext } from '@adonisjs/core/http';
import redis from '@adonisjs/redis/services/main';
import cuid2 from '@paralleldrive/cuid2';
import { convert } from 'convert';
import env from '#start/env';

export class AuthChallengeService {
	private static readonly CHALLENGE_TTL = convert(5, 'minutes');

	private readonly cuid = cuid2.init({
		fingerprint: env.get('RAILWAY_REPLICA_ID'),
	});

	getSessionId(context: HttpContext): string {
		const existingId = context.request.cookie('session_id');

		if (existingId) {
			return existingId;
		}

		const newId = this.cuid();

		context.response.cookie('session_id', newId, { httpOnly: true, sameSite: 'strict' });

		return newId;
	}

	async setChallenge(session: string, challenge: string) {
		await redis.set(`auth:challenge:${session}`, challenge, 'EX', AuthChallengeService.CHALLENGE_TTL.to('s'));
	}

	/** Challenges must **always** be consumed, even if verification fails. */
	async getAndDeleteChallenge(session: string): Promise<string | undefined> {
		const challenge = await redis.getdel(`auth:challenge:${session}`);

		return challenge ?? undefined;
	}
}
