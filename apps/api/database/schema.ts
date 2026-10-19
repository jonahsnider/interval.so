import {
	boolean,
	customType,
	index,
	integer,
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

const citext = customType<{ data: string; notNull: false; default: false }>({
	dataType() {
		return 'citext';
	},
});

export const users = pgTable('users', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	displayName: text('display_name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const credentials = pgTable('credentials', {
	id: uuid('passkey_id').primaryKey().defaultRandom(),
	credentialId: text('id').notNull().unique(),
	publicKey: text('public_key').notNull(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	aaguid: text('webauthn_user_id'),
	name: text('name'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	counter: integer('counter').notNull().default(0),
	deviceType: text('device_type').notNull(),
	backedUp: boolean('backed_up').notNull().default(false),
	transports: text('transports').notNull().default(''),
});

// Required by Better Auth's core schema; Interval does not enable password or OAuth providers.
export const authAccounts = pgTable(
	'auth_accounts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(account) => [index().on(account.userId)],
);

export const authSessions = pgTable(
	'auth_sessions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
	},
	(session) => [index().on(session.userId)],
);

export const authVerifications = pgTable(
	'auth_verifications',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(verification) => [index().on(verification.identifier)],
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
			.references(() => users.id),
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
