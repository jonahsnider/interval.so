import assert from 'node:assert/strict';
import type { HttpContext } from '@adonisjs/core/http';
import redis from '@adonisjs/redis/services/main';
import cuid2 from '@paralleldrive/cuid2';
import { TRPCError } from '@trpc/server';
import { convert } from 'convert';
import { and, count, eq } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';

/** Manages tokens for guest passwords, which allow limited access to a team. */
export class GuestPasswordService {
	private static redisKey(teamSlug: string): string {
		return `team:${teamSlug}:guestTokens`;
	}

	private static readonly GUEST_PASSWORD_SESSION_LIFETIME = convert(6, 'months');

	private async verifyPassword(
		password: Pick<TeamSchema, 'password'>,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<boolean> {
		const [result] = await db
			.select({ count: count() })
			.from(Schema.teams)
			.where(and(eq(Schema.teams.slug, team.slug), eq(Schema.teams.password, password.password)));

		assert(result);

		return result.count > 0;
	}

	/** Do a guest password login for a team. */
	async guestPasswordLogin(input: Pick<TeamSchema, 'password' | 'slug'>, context: HttpContext): Promise<void> {
		const correct = await this.verifyPassword(input, input);

		if (!correct) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Incorrect password',
			});
		}

		const token = cuid2.createId();

		const pipeline = redis.pipeline();
		pipeline.sadd(GuestPasswordService.redisKey(input.slug), token);
		pipeline.expire(
			GuestPasswordService.redisKey(input.slug),
			GuestPasswordService.GUEST_PASSWORD_SESSION_LIFETIME.to('s'),
		);
		await pipeline.exec();

		context.session.put('guestToken', token);
	}

	async teamHasGuestToken(team: Pick<TeamSchema, 'slug'>, token: string): Promise<boolean> {
		const result = await redis.sismember(GuestPasswordService.redisKey(team.slug), token);

		return result === 1;
	}

	async clearTokensForTeam(team: Pick<TeamSchema, 'slug'>): Promise<void> {
		await redis.del(GuestPasswordService.redisKey(team.slug));
	}
}
