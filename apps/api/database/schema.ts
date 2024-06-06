import {
	boolean,
	customType,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core';

export const teamUserRole = pgEnum('team_user_role', ['owner', 'admin']);

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
	dataType() {
		return 'bytea';
	},
});

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	displayName: text('display_name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const credentials = pgTable(
	'credentials',
	{
		id: text('id').primaryKey().notNull(),
		publicKey: bytea('public_key').notNull(),
		userId: uuid('user_id').references(() => users.id),
		webauthnUserId: text('webauthn_user_id').notNull(),
		counter: integer('counter').notNull().default(0),
		deviceType: text('device_type').notNull(),
		backedUp: boolean('backed_up').notNull().default(false),
		transports: jsonb('transports').notNull().default([]),
	},
	(credentials) => ({
		index: index().on(credentials.webauthnUserId),
		unique: unique().on(credentials.userId, credentials.webauthnUserId),
	}),
);

export const teams = pgTable('teams', {
	slug: text('slug').primaryKey().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),

	password: text('password').notNull(),
	displayName: text('display_name').notNull(),
});

export const teamUsers = pgTable(
	'team_users',
	{
		teamSlug: text('team_slug').references(() => teams.slug),
		userId: uuid('user_id').references(() => users.id),
		role: teamUserRole('role').notNull().default('admin'),
	},
	(teamUsers) => ({
		primaryKey: primaryKey({ columns: [teamUsers.teamSlug, teamUsers.userId] }),
	}),
);

export const teamMembers = pgTable(
	'team_members',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		teamSlug: text('team_slug').references(() => teams.slug),
		name: text('name').notNull(),

		archived: boolean('archived').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	},
	(teamMembers) => ({
		unique: unique().on(teamMembers.teamSlug, teamMembers.name),
	}),
);

export const memberMeetings = pgTable(
	'member_meetings',
	{
		memberId: uuid('member_id').references(() => teamMembers.id),

		startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
		endedAt: timestamp('ended_at', { withTimezone: true }),
	},
	(memberMeetings) => ({
		primaryKey: primaryKey({ columns: [memberMeetings.memberId, memberMeetings.startedAt] }),
		startIndex: index().on(memberMeetings.startedAt),
		endIndex: index().on(memberMeetings.endedAt),
	}),
);
