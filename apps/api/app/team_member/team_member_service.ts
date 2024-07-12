import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { TRPCError } from '@trpc/server';
import { and, asc, count, eq, inArray, isNotNull, isNull, max, min } from 'drizzle-orm';
import postgres from 'postgres';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { MeetingAttendeeSchema } from '../meeting/schemas/team_meeting_schema.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from './events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from './events/team_member_events_service.js';
import type { SimpleTeamMemberSchema, TeamMemberSchema } from './schemas/team_member_schema.js';

/** A team member is someone whose attendance is tracked by team users. */
@inject()
@injectHelper(TeamMemberEventsService)
export class TeamMemberService {
	private static readonly MAX_MEMBERS_PER_TEAM = 1000;

	constructor(private readonly eventsService: TeamMemberEventsService) {}

	async getTeamMembersSimple(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<SimpleTeamMemberSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team));

		const result = await db.query.teams.findFirst({
			columns: {},
			where: eq(Schema.teams.slug, team.slug),
			with: {
				members: {
					columns: {
						id: true,
						name: true,
					},
					extras: {
						atMeeting: isNotNull(Schema.teamMembers.pendingSignIn).as('at_meeting'),
					},
					orderBy: asc(Schema.teamMembers.name),
					where: eq(Schema.teamMembers.archived, false),
				},
			},
		});

		return (
			result?.members.map((member) => ({
				id: member.id,
				name: member.name,
				atMeeting: member.atMeeting as boolean,
			})) ?? []
		);
	}

	async getTeamMembersFull(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<TeamMemberSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewFullMemberList', team));

		const result = await db.query.teams.findFirst({
			columns: {},
			where: eq(Schema.teams.slug, team.slug),
			with: {
				members: {
					columns: {
						id: true,
						name: true,
						archived: true,
						createdAt: true,
						pendingSignIn: true,
					},
					with: {
						attendance: {
							columns: {
								endedAt: true,
							},
							limit: 1,
							orderBy: asc(Schema.memberAttendance.endedAt),
						},
					},
				},
			},
		});

		return (
			result?.members.map((member) => ({
				id: member.id,
				name: member.name,
				archived: member.archived,
				createdAt: member.createdAt,
				atMeeting: Boolean(member.pendingSignIn),
				// If signed in, mark them as last seen now
				// Otherwise, use the last time they signed out
				lastSeenAt: member.pendingSignIn ? 'now' : member.attendance[0]?.endedAt,
			})) ?? []
		);
	}

	async create(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		data: Pick<TeamMemberSchema, 'name'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('create', team));

		const [dbTeam, [members]] = await Promise.all([
			db.query.teams.findFirst({
				columns: {
					id: true,
				},
				where: eq(Schema.teams.slug, team.slug),
			}),
			db
				.select({ count: count() })
				.from(Schema.teamMembers)
				.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
				.where(eq(Schema.teams.slug, team.slug)),
		]);

		assert(dbTeam, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));
		assert(members);

		if (members.count >= TeamMemberService.MAX_MEMBERS_PER_TEAM) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: `You can't have more than ${TeamMemberService.MAX_MEMBERS_PER_TEAM} members in a team, try deleting some members first`,
			});
		}

		try {
			await db.insert(Schema.teamMembers).values({
				teamId: dbTeam.id,
				name: data.name,
			});
		} catch (error) {
			if (error instanceof postgres.PostgresError && error.code === '23505') {
				// Team member name collision
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'A team member with that name already exists',
				});
			}

			throw error;
		}

		await this.eventsService.announceEvent(team, MemberRedisEvent.MemberCreated);
	}

	async updateAttendance(
		bouncer: AppBouncer,
		teamMember: Pick<TeamMemberSchema, 'id'>,
		data: Pick<TeamMemberSchema, 'atMeeting'>,
	) {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('updateAttendance', teamMember),
		);

		if (data.atMeeting) {
			await this.signIn(teamMember);
		} else {
			await this.signOut(teamMember);
		}

		const teamQuery = await db.query.teamMembers.findFirst({
			columns: {},
			where: eq(Schema.teamMembers.id, teamMember.id),
			with: { team: { columns: { id: true } } },
		});

		assert(teamQuery, new TypeError('Expected team to be associated with the team member'));
	}

	private async signIn(teamMember: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		// Mark the user as pending sign in right now
		// If they were already signed in, do nothing, we don't want to overwrite the old sign in time

		await db
			.update(Schema.teamMembers)
			.set({ pendingSignIn: new Date() })
			.where(
				and(
					eq(Schema.teamMembers.id, teamMember.id),
					isNull(Schema.teamMembers.pendingSignIn),
					eq(Schema.teamMembers.archived, false),
				),
			);

		await this.eventsService.announceEvent([teamMember], MemberRedisEvent.MemberAttendanceUpdated);
	}

	private async signOut(teamMember: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			const [pendingSignIn] = await tx
				.select({ pendingSignIn: Schema.teamMembers.pendingSignIn })
				.from(Schema.teamMembers)
				.where(and(eq(Schema.teamMembers.id, teamMember.id), eq(Schema.teamMembers.archived, false)));

			if (!pendingSignIn?.pendingSignIn) {
				return;
			}

			await tx.insert(Schema.memberAttendance).values({
				memberId: teamMember.id,
				startedAt: pendingSignIn.pendingSignIn,
				endedAt: new Date(),
			});

			await tx
				.update(Schema.teamMembers)
				.set({ pendingSignIn: null })
				.where(and(eq(Schema.teamMembers.id, teamMember.id), eq(Schema.teamMembers.archived, false)));
		});

		await this.eventsService.announceEvent([teamMember], MemberRedisEvent.MemberAttendanceUpdated);
	}

	async setArchived(bouncer: AppBouncer, member: Pick<TeamMemberSchema, 'id' | 'archived'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', [member]));

		if (member.archived) {
			const dbMember = await db.query.teamMembers.findFirst({
				columns: {
					pendingSignIn: true,
				},
				where: eq(Schema.teamMembers.id, member.id),
			});

			if (dbMember?.pendingSignIn) {
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'Cannot archive a member who is currently signed in',
				});
			}
		}

		await db
			.update(Schema.teamMembers)
			.set({ archived: member.archived, pendingSignIn: null })
			.where(eq(Schema.teamMembers.id, member.id));

		await this.eventsService.announceEvent([member], MemberRedisEvent.MemberUpdated);
	}

	async delete(bouncer: AppBouncer, member: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('delete', [member]));

		let team: Pick<TeamSchema, 'id'> | undefined;

		await db.transaction(async (tx) => {
			// Delete meetings
			await tx.delete(Schema.memberAttendance).where(eq(Schema.memberAttendance.memberId, member.id));
			// Delete member
			[team] = await tx.delete(Schema.teamMembers).where(eq(Schema.teamMembers.id, member.id)).returning({
				id: Schema.teamMembers.teamId,
			});
		});

		if (team) {
			await this.eventsService.announceEvent(team, MemberRedisEvent.MemberDeleted);
		}
	}

	async deleteFinishedMeeting(
		bouncer: AppBouncer,
		attendee: Pick<MeetingAttendeeSchema, 'attendanceId'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('deleteFinishedMeetings', [attendee]),
		);

		const [deleted] = await db
			.delete(Schema.memberAttendance)
			.where(eq(Schema.memberAttendance.id, attendee.attendanceId))
			.returning({
				memberId: Schema.memberAttendance.memberId,
			});

		if (deleted) {
			await this.eventsService.announceEvent(
				[
					{
						id: deleted.memberId,
					},
				],
				MemberRedisEvent.MemberAttendanceUpdated,
			);
		}
	}

	async getMember(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
	): Promise<Pick<TeamMemberSchema, 'name' | 'archived' | 'atMeeting'>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('view', [member]));

		const dbMember = await db.query.teamMembers.findFirst({
			where: eq(Schema.teamMembers.id, member.id),
			columns: {
				name: true,
				archived: true,
			},
			extras: {
				atMeeting: isNotNull(Schema.teamMembers.pendingSignIn).as('at_meeting'),
			},
		});

		assert(dbMember, new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' }));

		return {
			name: dbMember.name,
			archived: dbMember.archived,
			atMeeting: Boolean(dbMember.atMeeting),
		};
	}

	// TODO: Move this to a new TeamMemberAttendanceService & rename finishedMemberMeetings to teamMemberAttendance
	async createFinishedMeeting(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
		data: Pick<MeetingAttendeeSchema, 'startedAt' | 'endedAt'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('createFinishedMeeting', [member]),
		);

		await db.insert(Schema.memberAttendance).values({
			startedAt: data.startedAt,
			endedAt: data.endedAt,
			memberId: member.id,
		});

		await this.eventsService.announceEvent([member], MemberRedisEvent.MemberAttendanceUpdated);
	}

	async mergeFinishedMeetings(bouncer: AppBouncer, data: Pick<MeetingAttendeeSchema, 'attendanceId'>[]): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('mergeFinishedMeetings', data));

		// Get the earliest start time and the latest end time, delete all the the specified meetings, then insert a new one

		const updatedMember = await db.transaction(async (tx) => {
			const attendanceIds = data.map((entry) => entry.attendanceId);

			const [result] = await tx
				.select({
					startedAt: min(Schema.memberAttendance.startedAt),
					endedAt: max(Schema.memberAttendance.endedAt),
					memberId: Schema.memberAttendance.memberId,
				})
				.from(Schema.memberAttendance)
				.limit(1)
				.groupBy(Schema.memberAttendance.memberId)
				.where(inArray(Schema.memberAttendance.id, attendanceIds));

			await tx.delete(Schema.memberAttendance).where(inArray(Schema.memberAttendance.id, attendanceIds));

			assert(
				result?.startedAt && result.endedAt,
				new TRPCError({ code: 'NOT_FOUND', message: 'Attendance entries not found' }),
			);

			await tx.insert(Schema.memberAttendance).values({
				startedAt: result.startedAt,
				endedAt: result.endedAt,
				memberId: result.memberId,
			});

			return { id: result.memberId };
		});

		await this.eventsService.announceEvent([updatedMember], MemberRedisEvent.MemberAttendanceUpdated);
	}

	async deleteManyFinishedMeetings(
		bouncer: AppBouncer,
		attendanceEntries: Pick<MeetingAttendeeSchema, 'attendanceId'>[],
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('deleteFinishedMeetings', attendanceEntries),
		);

		const attendanceIds = attendanceEntries.map((entry) => entry.attendanceId);

		const affectedMembers = await db
			.delete(Schema.memberAttendance)
			.where(inArray(Schema.memberAttendance.id, attendanceIds))
			.returning({
				id: Schema.memberAttendance.memberId,
			});

		await this.eventsService.announceEvent(affectedMembers, MemberRedisEvent.MemberAttendanceUpdated);
	}

	async setName(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
		data: Pick<TeamMemberSchema, 'name'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', [member]));

		await db.update(Schema.teamMembers).set(data).where(eq(Schema.teamMembers.id, member.id));

		await this.eventsService.announceEvent([member], MemberRedisEvent.MemberUpdated);
	}
}
