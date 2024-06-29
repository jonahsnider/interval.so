import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import redis from '@adonisjs/redis/services/main';
import cuid2 from '@paralleldrive/cuid2';
import { TRPCError } from '@trpc/server';
import { convert } from 'convert';
import { and, eq } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { injectHelper } from '../../util/inject_helper.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamService } from '../team/team_service.js';

/** Manages tokens for guest passwords, which allow limited access to a team. */
@inject()
@injectHelper(TeamService)
export class GuestPasswordService {
	private static redisKey(guestToken: string): string {
		return `guestToken:${guestToken}`;
	}

	private static readonly GUEST_PASSWORD_SESSION_LIFETIME = convert(6, 'months');

	constructor(private readonly teamService: TeamService) {}

	/** Find a team by its slug and password, returning the ID if a match is found. */
	private async verifyPassword(
		password: Pick<TeamSchema, 'password'>,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Pick<TeamSchema, 'id'> | undefined> {
		const result = await db.query.teams.findFirst({
			where: and(eq(Schema.teams.slug, team.slug), eq(Schema.teams.password, password.password)),
			columns: {
				id: true,
			},
		});

		return result;
	}

	/** Do a guest password login for a team. */
	async guestPasswordLogin(input: Pick<TeamSchema, 'password' | 'slug'>, context: HttpContext): Promise<void> {
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

		context.session.put('guestToken', token);
	}

	async teamHasGuestToken(team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>, token: string): Promise<boolean> {
		const tokenTeam = await this.getTeamFromToken(token);

		if (!tokenTeam) {
			return false;
		}

		let teamWithId: Pick<TeamSchema, 'id'>;

		if ('id' in team) {
			teamWithId = team;
		} else {
			const maybeTeam = await this.teamService.getTeamBySlug(team);

			if (!maybeTeam) {
				// Don't throw an error, that leaks team existence
				return false;
			}

			teamWithId = maybeTeam;
		}

		return tokenTeam.id === teamWithId.id;
	}

	async getTeamFromToken(token: string): Promise<Pick<TeamSchema, 'id'> | undefined> {
		const result = await redis.get(GuestPasswordService.redisKey(token));

		if (!result) {
			return undefined;
		}

		return { id: result };
	}
}
