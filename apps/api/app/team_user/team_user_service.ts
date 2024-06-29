import { and, count, eq, inArray } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { UserSchema } from '../user/schemas/user_schema.js';

/** Team users are editors/viewers/admins of a team, who manage settings & attendance. */
export class TeamUserService {
	async userHasRoleInTeam(
		actor: Pick<UserSchema, 'id'>,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
		roles: Schema.TeamUserRole[],
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
				.from(Schema.teamUsers)
				.where(
					and(
						// User is a team user
						eq(Schema.teamUsers.userId, actor.id),
						// Team ID matches the input
						eq(Schema.teamUsers.teamId, team.id),
						// User has a role with edit permissions
						inArray(Schema.teamUsers.role, roles),
					),
				);
		} else {
			// Get team by slug
			[result] = await db
				.select({ count: count() })
				.from(Schema.teamUsers)
				.innerJoin(
					Schema.teams,
					and(
						// User is on the team
						eq(Schema.teamUsers.teamId, Schema.teams.id),
						// Team slug matches the input
						eq(Schema.teams.slug, team.slug),
					),
				)
				.where(
					and(
						// User is a team user
						eq(Schema.teamUsers.userId, actor.id),
						// User has a role with edit permissions
						inArray(Schema.teamUsers.role, roles),
					),
				);
		}

		return result ? result.count > 0 : false;
	}
}
