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

// TODO: The current database migrations have a "viewer" value, but it's annoying to remove that in Postgres + Drizzle can't handle it
export const teamManagerRole = pgEnum('team_user_role', ['owner', 'admin', 'editor']);
export type TeamManagerRole = (typeof teamManagerRole)['enumValues'][number];

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
	dataType() {
		return 'bytea';
	},
});

const citext = customType<{ data: string; notNull: false; default: false }>({
	dataType() {
		return 'citext';
	},
});

export const users = pgTable('users', {
	userId: uuid('id').notNull().primaryKey().defaultRandom(),
	displayName: text('display_name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const credentials = pgTable(
	'credentials',
	{
		credentialId: text('id').primaryKey().notNull(),
		publicKey: bytea('public_key').notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.userId, { onDelete: 'cascade' }),
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
	teamId: uuid('id').primaryKey().defaultRandom(),
	slug: citext('slug').unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

	password: text('password').notNull(),
	displayName: text('display_name').notNull(),
	inviteCode: text('invite_code').unique().notNull(),
});

export const teamManagers = pgTable(
	// TODO: Rename to "team_managers" - blocked by https://github.com/drizzle-team/drizzle-orm/issues/2344
	'team_users',
	{
		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.teamId),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.userId),
		role: teamManagerRole('role').notNull().default('admin'),
	},
	(teamManagers) => ({
		primaryKey: primaryKey({ columns: [teamManagers.teamId, teamManagers.userId] }),
		roleIndex: index().on(teamManagers.role),
	}),
);

export const teamMembers = pgTable(
	'team_members',
	{
		memberId: uuid('id').notNull().primaryKey().defaultRandom(),
		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.teamId),
		name: text('name').notNull(),

		archived: boolean('archived').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

		pendingSignIn: timestamp('pending_sign_in', { withTimezone: true }),
	},
	(teamMembers) => ({
		unique: unique().on(teamMembers.teamId, teamMembers.name),
	}),
);

export const memberAttendance = pgTable(
	'member_attendance',
	{
		memberAttendanceId: uuid('id').notNull().primaryKey().defaultRandom(),
		memberId: uuid('member_id')
			.references(() => teamMembers.memberId)
			.notNull(),

		startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
		endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
	},
	(memberMeetings) => ({
		memberIdIndex: index().on(memberMeetings.memberId),
		startedAtIndex: index().on(memberMeetings.startedAt),
		endedAtIndex: index().on(memberMeetings.endedAt),
	}),
);
