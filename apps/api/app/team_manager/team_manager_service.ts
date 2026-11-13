import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { and, asc, eq, not, sql } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { db } from '../db/db_service.ts';
import type { TeamSchema } from '../team/schemas/team_schema.ts';
import type { UserSchema } from '../user/schemas/user_schema.ts';
import { type Actor, assertTeamRole, getTeamRole } from '../authorization/authorization.ts';
import {
	getAllowedRoleModifications,
	minimumRoleToManage,
	type TeamManagerSchema,
} from './schemas/team_manager_schema.ts';

/** Team managers are editors/admins of a team, who manage settings & attendance. */
export class TeamManagerService {
	async teamNamesForUser(user: Pick<UserSchema, 'id'>): Promise<Pick<TeamSchema, 'displayName' | 'slug' | 'id'>[]> {
		const result = await db
			.select({ teamDisplayName: Schema.teams.displayName, teamSlug: Schema.teams.slug, teamId: Schema.teams.teamId })
			.from(Schema.teamManagers)
			.innerJoin(
				Schema.teams,
				and(eq(Schema.teamManagers.teamId, Schema.teams.teamId), eq(Schema.teamManagers.userId, user.id)),
			)
			.orderBy(asc(Schema.teams.displayName));

		return result.map((element) => ({
			displayName: element.teamDisplayName,
			slug: element.teamSlug,
			id: element.teamId,
		}));
	}

	async getUserRole(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
		user: Pick<UserSchema, 'id'>,
	): Promise<Pick<TeamManagerSchema, 'role'>> {
		// Don't leak team user IDs if the actor isn't in the team
		await assertTeamRole(actor, team, 'editor');

		const dbTeam = await db.query.teams.findFirst({
			columns: {},
			where: { slug: team.slug },
			with: {
				managers: {
					where: { userId: user.id },
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

	async removeManager(actor: Actor, team: Pick<TeamSchema, 'slug'>, user: Pick<UserSchema, 'id'>): Promise<void> {
		const target = await this.getUserRole(actor, team, user);
		await assertTeamRole(actor, team, minimumRoleToManage(target));

		const teams = db.select({ teamId: Schema.teams.teamId }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug));

		await db
			.delete(Schema.teamManagers)
			.where(and(eq(Schema.teamManagers.userId, user.id), eq(Schema.teamManagers.teamId, teams)));
	}

	async leave(actor: Actor, team: Pick<TeamSchema, 'slug'>, user: Pick<UserSchema, 'id'>): Promise<void> {
		// This is just to check if they have access to the team
		await assertTeamRole(actor, team, 'editor');

		const teams = db.select({ teamId: Schema.teams.teamId }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug));

		await db.delete(Schema.teamManagers).where(
			and(
				eq(Schema.teamManagers.userId, user.id),
				eq(Schema.teamManagers.teamId, teams),
				// Not the owner of the team
				not(eq(Schema.teamManagers.role, 'owner')),
			),
		);
	}

	async getList(actor: Actor, team: Pick<TeamSchema, 'slug'>): Promise<TeamManagerSchema[]> {
		await assertTeamRole(actor, team, 'editor');

		const result = await db
			.select({
				userId: Schema.teamManagers.userId,
				userDisplayName: Schema.users.displayName,
				role: Schema.teamManagers.role,
			})
			.from(Schema.teamManagers)
			.innerJoin(
				Schema.teams,
				and(eq(Schema.teamManagers.teamId, Schema.teams.teamId), eq(Schema.teams.slug, team.slug)),
			)
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
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
		target: Pick<UserSchema, 'id'>,
		change: Pick<TeamManagerSchema, 'role'>,
	): Promise<void> {
		const targetRole = await this.getUserRole(actor, team, target);
		const actorRole = await getTeamRole(actor, team);
		const allowedRoles =
			actorRole && actorRole !== 'guest' ? getAllowedRoleModifications({ role: actorRole }, targetRole) : [];

		if (!allowedRoles.includes(change.role)) {
			throw new TRPCError({ code: 'FORBIDDEN' });
		}

		const teams = db.select({ teamId: Schema.teams.teamId }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug));

		await db.transaction(async (tx) => {
			if (change.role === 'owner') {
				// The is setting a new owner, and we know that they can only have passed authorization if they are also the owner
				// So we change the existing owner to be an admin
				await tx
					.update(Schema.teamManagers)
					.set({ role: 'admin' })
					.where(and(eq(Schema.teamManagers.role, 'owner'), eq(Schema.teamManagers.teamId, teams)));
			}

			await tx
				.update(Schema.teamManagers)
				.set({ role: change.role })
				.where(and(eq(Schema.teamManagers.userId, target.id), eq(Schema.teamManagers.teamId, teams)));
		});
	}

	async joinTeam(
		team: Pick<TeamSchema, 'inviteCode'>,
		user: Pick<UserSchema, 'id'>,
	): Promise<Pick<TeamSchema, 'slug'>> {
		const inputTeam = db
			.select({ teamId: Schema.teams.teamId })
			.from(Schema.teams)
			.where(eq(Schema.teams.inviteCode, team.inviteCode));

		const [newManager] = await db
			.insert(Schema.teamManagers)
			.values({
				teamId: sql`(${inputTeam})`,
				userId: user.id,
				role: 'editor',
			})
			.returning({ teamId: Schema.teamManagers.teamId })
			// Conflict occurs if you're already a manager of the team
			.onConflictDoNothing();

		assert(newManager, new TRPCError({ code: 'BAD_REQUEST', message: 'You are already a manager of this team' }));

		const dbTeam = await db.query.teams.findFirst({
			columns: {
				slug: true,
			},
			where: { teamId: newManager.teamId },
		});

		assert(dbTeam, new TypeError('Expected team to be associated with the team manager'));

		return dbTeam;
	}
}
