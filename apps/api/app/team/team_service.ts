import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { and, count, eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { UserSchema } from '../user/schemas/user_schema.js';
import type { TeamSchema } from './schemas/team_schema.js';

export class TeamService {
	private static readonly MAX_TEAMS_PER_USER = 10;

	async teamNamesForUser(user: Pick<UserSchema, 'id'>): Promise<Pick<TeamSchema, 'displayName' | 'slug'>[]> {
		const teamUsers = await db.query.teamUsers.findMany({
			where: eq(Schema.teamUsers.userId, user.id),
			with: {
				team: {
					columns: {
						displayName: true,
						slug: true,
					},
				},
			},
		});

		return teamUsers.map((team) => ({
			displayName: team.team.displayName,
			slug: team.team.slug,
		}));
	}

	async create(
		input: Pick<TeamSchema, 'displayName' | 'password' | 'slug'>,
		user: Pick<UserSchema, 'id'>,
	): Promise<void> {
		// Count teams this user is an owner of
		const [ownedTeams] = await db
			.select({ count: count() })
			.from(Schema.teamUsers)
			.where(and(eq(Schema.teamUsers.userId, user.id), eq(Schema.teamUsers.role, 'owner')));

		assert(ownedTeams);

		if (ownedTeams.count > TeamService.MAX_TEAMS_PER_USER) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: `You can't be the owner of more than ${TeamService.MAX_TEAMS_PER_USER} teams`,
			});
		}

		try {
			await db.transaction(async (tx) => {
				// Create team
				const [team] = await tx.insert(Schema.teams).values(input).returning({ id: Schema.teams.id });

				assert(team);

				// Create team user
				await tx.insert(Schema.teamUsers).values({
					teamId: team.id,
					userId: user.id,
					role: 'owner',
				});
			});
		} catch (error) {
			if (error instanceof postgres.PostgresError && error.code === '23505') {
				// Team slug collision
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'A team with that URL already exists',
				});
			}

			throw error;
		}
	}

	async getDisplayName(team: Pick<TeamSchema, 'slug'>): Promise<string> {
		// No auth needed, team display name/existence is public

		const result = await db.query.teams.findFirst({
			where: eq(Schema.teams.slug, team.slug),
			columns: {
				displayName: true,
			},
		});

		assert(result, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));

		return result.displayName;
	}

	async getTeamById(team: Pick<TeamSchema, 'id'>): Promise<Pick<TeamSchema, 'slug'> | undefined> {
		const result = await db.query.teams.findFirst({
			where: eq(Schema.teams.id, team.id),
			columns: {
				slug: true,
			},
		});

		return result;
	}

	async delete(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('delete', team));

		await db.transaction(async (tx) => {
			const targetTeamCte = tx
				.$with('target_team_cte')
				.as(tx.select({ id: Schema.teams.id }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug)));

			const targetTeamSubquery = tx.select({ id: targetTeamCte.id }).from(targetTeamCte);

			// Delete team meetings
			await tx
				.with(targetTeamCte)
				.delete(Schema.finishedMemberMeetings)
				.where(eq(Schema.finishedMemberMeetings.memberId, targetTeamSubquery));
			// Delete team members
			await tx.with(targetTeamCte).delete(Schema.teamMembers).where(eq(Schema.teamMembers.teamId, targetTeamSubquery));
			// Delete team managers
			await tx.with(targetTeamCte).delete(Schema.teamUsers).where(eq(Schema.teamUsers.teamId, targetTeamSubquery));
			// Delete team
			await tx.delete(Schema.teams).where(eq(Schema.teams.slug, team.slug));
		});
	}
}
