import assert from 'node:assert/strict';
import redis from '@adonisjs/redis/services/main';
import type { Session } from '@adonisjs/session';
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

	/** Find a team by its slug and password, returning the ID if a match is found. */
	private async verifyPassword(
		password: Pick<TeamSchema, 'password'>,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Pick<TeamSchema, 'id'> | undefined> {
		const result = await db.query.teams.findFirst({
			where: and(eq(Schema.teams.slug, team.slug), eq(Schema.teams.password, password.password)),
			columns: {
				teamId: true,
			},
		});

		if (!result) {
			return undefined;
		}

		return {
			id: result.teamId,
		};
	}

	/** Do a guest password login for a team. */
	async guestPasswordLogin(input: Pick<TeamSchema, 'password' | 'slug'>, session: Session): Promise<void> {
		const foundTeam = await this.verifyPassword(input, input);

		if (!foundTeam) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Incorrect password',
			});
		}

		const token = cuid2.createId();

		// Map the token to the team ID
		await redis.set(
			GuestPasswordService.redisKey(token),
			foundTeam.id,
			'EX',
			GuestPasswordService.GUEST_PASSWORD_SESSION_LIFETIME.to('s'),
		);

		session.put('guestToken', token);
	}

	async teamHasGuestToken(team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>, token: string): Promise<boolean> {
		const tokenTeam = await this.getTeamFromToken(token);

		if (!tokenTeam) {
			return false;
		}

		if ('id' in team) {
			return tokenTeam.id === team.id;
		}

		const [result] = await db
			.select({
				count: count(),
			})
			.from(Schema.teams)
			.where(and(eq(Schema.teams.slug, team.slug), eq(Schema.teams.teamId, tokenTeam.id)));

		assert(result);

		return result.count > 0;
	}

	async getTeamFromToken(token: string): Promise<Pick<TeamSchema, 'id'> | undefined> {
		const result = await redis.get(GuestPasswordService.redisKey(token));

		if (!result) {
			return undefined;
		}

		return { id: result };
	}
}
