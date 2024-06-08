import { eq } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { db } from '../db/db_service.js';
import type { UserSchema } from '../user/schemas/user_schema.js';
import type { TeamSchema } from './schemas/team_schema.js';

export class TeamService {
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
}
