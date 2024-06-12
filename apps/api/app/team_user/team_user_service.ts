import assert from 'node:assert/strict';
import { and, count, eq, inArray } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { UserSchema } from '../user/schemas/user_schema.js';

/** Team users are editors/viewers/admins of a team, who manage settings & attendance. */
export class TeamUserService {
	async userHasRoleInTeam(
		actor: Pick<UserSchema, 'id'>,
		team: Pick<TeamSchema, 'slug'>,
		roles: Schema.TeamUserRole[],
	): Promise<boolean> {
		const [result] = await db
			.select({ count: count() })
			.from(Schema.teamUsers)
			.where(
				and(
					// User is a team user
					eq(Schema.teamUsers.userId, actor.id),
					// Team slug matches the input
					eq(Schema.teamUsers.teamSlug, team.slug),
					// User has a role with edit permissions
					inArray(Schema.teamUsers.role, roles),
				),
			);

		assert(result);

		return result.count > 0;
	}

	async getRoleForTeam(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<Schema.TeamUserRole | undefined> {
		if (!actor.id) {
			return undefined;
		}

		const foundUser = await db.query.teamUsers.findFirst({
			columns: {
				role: true,
			},
			where: and(
				// User is a team user
				eq(Schema.teamUsers.userId, actor.id),
				// Team slug matches the input
				eq(Schema.teamUsers.teamSlug, team.slug),
			),
		});

		return foundUser?.role;
	}
}
