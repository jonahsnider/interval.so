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
	private static redisKey(guestToken: string): string {
		return `guestToken:${guestToken}`;
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

		// Map the token to the team
		await redis.set(
			GuestPasswordService.redisKey(token),
			input.slug,
			'EX',
			GuestPasswordService.GUEST_PASSWORD_SESSION_LIFETIME.to('s'),
		);

		context.session.put('guestToken', token);
	}

	async teamHasGuestToken(team: Pick<TeamSchema, 'slug'>, token: string): Promise<boolean> {
		const tokenTeam = await this.getTeamFromToken(token);

		if (!tokenTeam) {
			return false;
		}

		return tokenTeam.slug === team.slug;
	}

	async clearTokensForTeam(team: Pick<TeamSchema, 'slug'>): Promise<void> {
		await redis.del(GuestPasswordService.redisKey(team.slug));
	}

	async getTeamFromToken(token: string): Promise<Pick<TeamSchema, 'slug'> | undefined> {
		const result = await redis.get(GuestPasswordService.redisKey(token));

		if (!result) {
			return undefined;
		}

		return { slug: result };
	}
}
