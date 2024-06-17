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
export type TeamUserRole = (typeof teamUserRole)['enumValues'][number];

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
	dataType() {
		return 'bytea';
	},
});

export const users = pgTable('users', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	displayName: text('display_name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const credentials = pgTable(
	'credentials',
	{
		id: text('id').primaryKey().notNull(),
		publicKey: bytea('public_key').notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
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
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

	password: text('password').notNull(),
	displayName: text('display_name').notNull(),
});

export const teamUsers = pgTable(
	'team_users',
	{
		teamSlug: text('team_slug')
			.notNull()
			.references(() => teams.slug),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		role: teamUserRole('role').notNull().default('admin'),
	},
	(teamUsers) => ({
		primaryKey: primaryKey({ columns: [teamUsers.teamSlug, teamUsers.userId] }),
		roleIndex: index().on(teamUsers.role),
	}),
);

export const teamMembers = pgTable(
	'team_members',
	{
		id: uuid('id').notNull().primaryKey().defaultRandom(),
		teamSlug: text('team_slug')
			.notNull()
			.references(() => teams.slug),
		name: text('name').notNull(),

		archived: boolean('archived').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

		pendingSignIn: timestamp('pending_sign_in', { withTimezone: true }),
	},
	(teamMembers) => ({
		unique: unique().on(teamMembers.teamSlug, teamMembers.name),
	}),
);

export const finishedMemberMeetings = pgTable(
	'finished_member_meetings',
	{
		id: uuid('id').notNull().primaryKey().defaultRandom(),
		memberId: uuid('member_id')
			.references(() => teamMembers.id)
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
