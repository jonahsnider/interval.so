import { relations } from 'drizzle-orm/relations';
import { credentials, memberAttendance, teamManagers, teamMembers, teams, users } from './schema.js';

export const usersRelations = relations(users, ({ many }) => ({
	teamManagers: many(teamManagers),
}));

export const credentialsRelations = relations(credentials, ({ one }) => ({
	user: one(users, {
		fields: [credentials.userId],
		references: [users.id],
	}),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
	members: many(teamMembers),
	managers: many(teamManagers),
}));

export const teamManagersRelations = relations(teamManagers, ({ one }) => ({
	team: one(teams, {
		fields: [teamManagers.teamId],
		references: [teams.id],
	}),
	user: one(users, {
		fields: [teamManagers.userId],
		references: [users.id],
	}),
}));

export const memberAttendanceRelations = relations(memberAttendance, ({ one }) => ({
	member: one(teamMembers, {
		fields: [memberAttendance.memberId],
		references: [teamMembers.id],
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id],
	}),
	attendance: many(memberAttendance),
}));
