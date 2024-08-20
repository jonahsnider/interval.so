import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { db } from '../db/db_service.js';
import { GuestPasswordService } from '../guest_password/guest_password_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamManagerService } from '../team_manager/team_manager_service.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import type { AttendanceEntrySchema } from '../team_member_attendance/schemas/attendance_entry_schema.js';

export type TeamRole = Schema.TeamManagerRole | 'guestToken';

@inject()
@injectHelper(GuestPasswordService, TeamManagerService)
export class AuthorizationService {
	static async assertPermission(allowsPromise: Promise<boolean>): Promise<void> {
		assert(await allowsPromise, new TRPCError({ code: 'FORBIDDEN' }));
	}

	constructor(
		private readonly guestPasswordService: GuestPasswordService,
		private readonly teamManagerService: TeamManagerService,
	) {}

	async hasRoles(
		actor: BouncerUser | undefined,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
		roles: TeamRole[],
	): Promise<boolean> {
		if (!actor) {
			return false;
		}

		if (actor.id === undefined) {
			// No team user, so we can only check the guest token

			if (!roles.includes('guestToken')) {
				// Guest token wasn't a valid role, so we don't need to check the token

				return false;
			}

			return this.guestPasswordService.teamHasGuestToken(team, actor.unvalidatedGuestToken);
		}

		// Check if the DB contains any of the allowed roles
		return this.teamManagerService.userHasRoleInTeam(
			actor,
			team,
			roles.filter((role): role is Schema.TeamManagerRole => role !== 'guestToken'),
		);
	}

	/** Given an actor, an array of team members, and an array of roles, return whether all the members are in the team, and the actor has one of the roles. */
	async hasRolesByTeamMembers(
		actor: BouncerUser | undefined,
		teamMembers: Pick<TeamMemberSchema, 'id'>[],
		roles: TeamRole[],
	): Promise<boolean> {
		if (!actor) {
			return false;
		}

		// First, we get all the teams for the team member IDs (or null, if the member ID doesn't exist)
		// If any of the teams are null, throw an error or return false or something
		// Then, we check if the actor has the correct roles for the team associated with those members

		const memberIds = teamMembers.map((member) => member.id);

		const teams = await db
			.select({ teamId: Schema.teamMembers.teamId })
			.from(Schema.teamMembers)
			.where(inArray(Schema.teamMembers.memberId, memberIds))
			.groupBy(Schema.teamMembers.teamId);

		if (teams.length === 0) {
			return false;
		}

		if (teams.length > 1) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: 'This operation may not reference team members from multiple teams',
			});
		}

		const [team] = teams;
		assert(team);

		return this.hasRoles(actor, { id: team.teamId }, roles);
	}

	async hasRolesByMeetingIds(
		actor: BouncerUser | undefined,
		meetings: Pick<AttendanceEntrySchema, 'attendanceId'>[],
		roles: TeamRole[],
	): Promise<boolean> {
		if (!actor) {
			return false;
		}

		const teams = await db
			.select({
				teamId: Schema.teamMembers.teamId,
			})
			.from(Schema.teamMembers)
			.innerJoin(Schema.memberAttendance, eq(Schema.teamMembers.memberId, Schema.memberAttendance.memberId))
			.where(
				and(
					eq(Schema.memberAttendance.memberId, Schema.teamMembers.memberId),
					inArray(
						Schema.memberAttendance.memberAttendanceId,
						meetings.map((meeting) => meeting.attendanceId),
					),
				),
			)
			.limit(1);

		const [team] = teams;

		if (!team) {
			return false;
		}

		if (teams.length > 1) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: 'This operation may not reference team members from multiple teams',
			});
		}

		return this.hasRoles(actor, { id: team.teamId }, roles);
	}
}
