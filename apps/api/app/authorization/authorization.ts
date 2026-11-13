import type { Session } from '@adonisjs/session';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AccountSession } from '../auth/create_account_auth.ts';
import { db } from '../db/db_service.ts';
import { GuestPasswordService } from '../guest_password/guest_password_service.ts';
import type { TeamSchema } from '../team/schemas/team_schema.ts';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.ts';
import type { AttendanceEntrySchema } from '../team_member_attendance/schemas/attendance_entry_schema.ts';

/** Who is making a request: a signed-in user, a guest who entered a team's password, or nobody. */
export type Actor = { id: string } | { id: undefined; unvalidatedGuestToken: string } | null;

/** Roles within a team, from least to most privileged. Each role can do everything the roles before it can. */
export type TeamRole = 'guest' | Schema.TeamManagerRole;

const roleRank: Record<TeamRole, number> = { guest: 0, editor: 1, admin: 2, owner: 3 };

type TeamRef = Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>;

const guestPasswords = new GuestPasswordService();

function forbidden(): TRPCError {
	return new TRPCError({ code: 'FORBIDDEN' });
}

export function getActor(session: Session, account: AccountSession | null): Actor {
	if (account) {
		return { id: account.user.id };
	}

	const guestToken = session.get('guestToken') as string | undefined;

	return guestToken ? { id: undefined, unvalidatedGuestToken: guestToken } : null;
}

export async function getTeamRole(actor: Actor, team: TeamRef): Promise<TeamRole | undefined> {
	if (!actor) {
		return undefined;
	}

	if (actor.id === undefined) {
		return (await guestPasswords.teamHasGuestToken(team, actor.unvalidatedGuestToken)) ? 'guest' : undefined;
	}

	const [manager] = await db
		.select({ role: Schema.teamManagers.role })
		.from(Schema.teamManagers)
		.innerJoin(Schema.teams, eq(Schema.teamManagers.teamId, Schema.teams.teamId))
		.where(
			and(
				eq(Schema.teamManagers.userId, actor.id),
				'id' in team ? eq(Schema.teams.teamId, team.id) : eq(Schema.teams.slug, team.slug),
			),
		);

	return manager?.role;
}

/** Throws unless the actor has at least the given role in the team. */
export async function assertTeamRole(actor: Actor, team: TeamRef, minimum: TeamRole): Promise<void> {
	const role = await getTeamRole(actor, team);

	if (role === undefined || roleRank[role] < roleRank[minimum]) {
		throw forbidden();
	}
}

/** Throws unless all the members belong to one team, and the actor has at least the given role in it. */
export async function assertTeamRoleForMembers(
	actor: Actor,
	members: Pick<TeamMemberSchema, 'id'>[],
	minimum: TeamRole,
): Promise<void> {
	if (!actor) {
		throw forbidden();
	}

	const teams = await db
		.selectDistinct({ id: Schema.teamMembers.teamId })
		.from(Schema.teamMembers)
		.where(
			inArray(
				Schema.teamMembers.memberId,
				members.map((member) => member.id),
			),
		);

	await assertTeamRole(actor, singleTeam(teams), minimum);
}

/** Throws unless all the attendance entries belong to one team, and the actor has at least the given role in it. */
export async function assertTeamRoleForAttendance(
	actor: Actor,
	entries: Pick<AttendanceEntrySchema, 'attendanceId'>[],
	minimum: TeamRole,
): Promise<void> {
	if (!actor) {
		throw forbidden();
	}

	const teams = await db
		.selectDistinct({ id: Schema.teamMembers.teamId })
		.from(Schema.teamMembers)
		.innerJoin(Schema.memberAttendance, eq(Schema.teamMembers.memberId, Schema.memberAttendance.memberId))
		.where(
			inArray(
				Schema.memberAttendance.memberAttendanceId,
				entries.map((entry) => entry.attendanceId),
			),
		);

	await assertTeamRole(actor, singleTeam(teams), minimum);
}

function singleTeam(teams: Pick<TeamSchema, 'id'>[]): Pick<TeamSchema, 'id'> {
	if (teams.length > 1) {
		throw new TRPCError({
			code: 'UNPROCESSABLE_CONTENT',
			message: 'This operation may not reference team members from multiple teams',
		});
	}

	const [team] = teams;

	if (!team) {
		throw forbidden();
	}

	return team;
}
