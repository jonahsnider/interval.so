import { defineRelations } from 'drizzle-orm';
import * as schema from './schema.ts';

export const relations = defineRelations(schema, (r) => ({
	users: {
		teamManagers: r.many.teamManagers(),
	},
	credentials: {
		user: r.one.users({
			from: r.credentials.userId,
			to: r.users.id,
			optional: false,
		}),
	},
	teams: {
		members: r.many.teamMembers(),
		managers: r.many.teamManagers(),
	},
	teamManagers: {
		team: r.one.teams({
			from: r.teamManagers.teamId,
			to: r.teams.teamId,
			optional: false,
		}),
		user: r.one.users({
			from: r.teamManagers.userId,
			to: r.users.id,
			optional: false,
		}),
	},
	memberAttendance: {
		member: r.one.teamMembers({
			from: r.memberAttendance.memberId,
			to: r.teamMembers.memberId,
			optional: false,
		}),
	},
	teamMembers: {
		team: r.one.teams({
			from: r.teamMembers.teamId,
			to: r.teams.teamId,
			optional: false,
		}),
		attendance: r.many.memberAttendance(),
	},
}));
