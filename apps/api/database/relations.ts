import { relations } from 'drizzle-orm/relations';
import { credentials, memberMeetings, teamMembers, teamUsers, teams, users } from './schema.js';

export const usersRelations = relations(users, ({ many }) => ({
	teamUsers: many(teamUsers),
}));

export const credentialsRelations = relations(credentials, ({ one }) => ({
	user: one(users, {
		fields: [credentials.userId],
		references: [users.id],
	}),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
	members: many(teamMembers),
	users: many(teamUsers),
}));

export const teamUsersRelations = relations(teamUsers, ({ one }) => ({
	team: one(teams, {
		fields: [teamUsers.teamSlug],
		references: [teams.slug],
	}),
	user: one(users, {
		fields: [teamUsers.userId],
		references: [users.id],
	}),
}));

export const memberMeetingsRelations = relations(memberMeetings, ({ one }) => ({
	member: one(teamMembers, {
		fields: [memberMeetings.memberId],
		references: [teamMembers.id],
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
	team: one(teams, {
		fields: [teamMembers.teamSlug],
		references: [teams.slug],
	}),
	meetings: many(memberMeetings),
}));
