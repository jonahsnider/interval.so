import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { and, asc, count, eq, inArray, not } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { UserSchema } from '../user/schemas/user_schema.js';
import type { TeamManagerSchema } from './schemas/team_manager_schema.js';

/** Team managers are editors/admins of a team, who manage settings & attendance. */
export class TeamManagerService {
	async teamNamesForUser(user: Pick<UserSchema, 'id'>): Promise<Pick<TeamSchema, 'displayName' | 'slug'>[]> {
		const result = await db
			.select({ teamDisplayName: Schema.teams.displayName, teamSlug: Schema.teams.slug })
			.from(Schema.teamManagers)
			.innerJoin(
				Schema.teams,
				and(eq(Schema.teamManagers.teamId, Schema.teams.id), eq(Schema.teamManagers.userId, user.id)),
			)
			.orderBy(asc(Schema.teams.displayName));

		return result.map((element) => ({
			displayName: element.teamDisplayName,
			slug: element.teamSlug,
		}));
	}

	async userHasRoleInTeam(
		actor: Pick<UserSchema, 'id'>,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
		roles: Schema.TeamManagerRole[],
	): Promise<boolean> {
		let result:
			| {
					count: number;
			  }
			| undefined;

		if ('id' in team) {
			// Get team by ID
			[result] = await db
				.select({ count: count() })
				.from(Schema.teamManagers)
				.where(
					and(
						// User is a team user
						eq(Schema.teamManagers.userId, actor.id),
						// Team ID matches the input
						eq(Schema.teamManagers.teamId, team.id),
						// User has a role with edit permissions
						inArray(Schema.teamManagers.role, roles),
					),
				);
		} else {
			// Get team by slug
			[result] = await db
				.select({ count: count() })
				.from(Schema.teamManagers)
				.innerJoin(
					Schema.teams,
					and(
						// User is on the team
						eq(Schema.teamManagers.teamId, Schema.teams.id),
						// Team slug matches the input
						eq(Schema.teams.slug, team.slug),
					),
				)
				.where(
					and(
						// User is a team user
						eq(Schema.teamManagers.userId, actor.id),
						// User has a role with edit permissions
						inArray(Schema.teamManagers.role, roles),
					),
				);
		}

		return result ? result.count > 0 : false;
	}

	async getUserRole(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		user: Pick<UserSchema, 'id'>,
	): Promise<Pick<TeamManagerSchema, 'role'>> {
		// Don't leak team user IDs if the actor isn't in the team
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewSettings', team));

		const dbTeam = await db.query.teams.findFirst({
			columns: {},
			where: eq(Schema.teams.slug, team.slug),
			with: {
				managers: {
					where: eq(Schema.teamManagers.userId, user.id),
					columns: {
						role: true,
					},
					limit: 1,
				},
			},
		});

		const result = dbTeam?.managers[0];

		assert(result, new TRPCError({ code: 'NOT_FOUND', message: 'User not found' }));

		return result;
	}

	async removeManager(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		user: Pick<UserSchema, 'id'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('removeUser', bouncer, team, user));

		const teams = db
			.$with('team_input')
			.as(db.select({ id: Schema.teams.id }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug)));

		await db.with(teams).delete(Schema.teamManagers).where(eq(Schema.teamManagers.userId, user.id));
	}

	async leave(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, user: Pick<UserSchema, 'id'>): Promise<void> {
		// This is just to check if they have access to the team
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewSettings', team));

		const teams = db
			.$with('team_input')
			.as(db.select({ id: Schema.teams.id }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug)));

		await db
			.with(teams)
			.delete(Schema.teamManagers)
			.where(
				and(
					eq(Schema.teamManagers.userId, user.id),
					// Not the owner of the team
					not(eq(Schema.teamManagers.role, 'owner')),
				),
			);
	}

	async getList(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<TeamManagerSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewSettings', team));

		const result = await db
			.select({
				userId: Schema.teamManagers.userId,
				userDisplayName: Schema.users.displayName,
				role: Schema.teamManagers.role,
			})
			.from(Schema.teamManagers)
			.innerJoin(Schema.teams, and(eq(Schema.teamManagers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.innerJoin(
				Schema.users,
				and(eq(Schema.teamManagers.userId, Schema.users.id), eq(Schema.users.id, Schema.teamManagers.userId)),
			)
			.orderBy(asc(Schema.teamManagers.role), asc(Schema.users.displayName));

		return result.map((row) => ({
			user: {
				id: row.userId,
				displayName: row.userDisplayName,
			},
			role: row.role,
		}));
	}

	async updateRole(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		target: Pick<UserSchema, 'id'>,
		change: Pick<TeamManagerSchema, 'role'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamPolicy').allows('updateUserRole', bouncer, team, target, change),
		);

		const teams = db.select({ id: Schema.teams.id }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug));

		await db
			.update(Schema.teamManagers)
			.set({ role: change.role })
			.where(and(eq(Schema.teamManagers.userId, target.id), eq(Schema.teamManagers.teamId, teams)));
	}
}
