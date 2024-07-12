import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { and, countDistinct, eq, gt, gte, inArray, isNotNull, lt, lte, max, min, sql } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import type { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import type { CreateTeamMeetingSchema } from './schemas/create_team_meeting_schema.js';
import type { MeetingAttendeeSchema, TeamMeetingSchema } from './schemas/team_meeting_schema.js';

@inject()
@injectHelper(TeamMemberEventsService)
export class TeamMeetingService {
	constructor(private readonly teamMemberEventsService: TeamMemberEventsService) {}

	// TODO: Consider making this a materialized view, as long as it's not expensive to refresh it. Maybe use https://github.com/sraoss/pg_ivm
	async getMeetings(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
	): Promise<TeamMeetingSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('viewList', team));

		// The giant query for grouping the overlapping sign-ins is from https://wiki.postgresql.org/wiki/Range_aggregation
		const s1 = db
			.select({
				startedAt: Schema.memberAttendance.startedAt,
				endedAt: Schema.memberAttendance.endedAt,
				memberId: Schema.memberAttendance.memberId,
				memberName: Schema.teamMembers.name,
				attendanceId: Schema.memberAttendance.id,
				le: sql<Date>`lag(${Schema.memberAttendance.endedAt}) OVER (ORDER BY ${Schema.memberAttendance.startedAt}, ${Schema.memberAttendance.endedAt})`.as(
					'le',
				),
			})
			.from(Schema.memberAttendance)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.memberAttendance.memberId, Schema.teamMembers.id),
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					// Need to manually stringify the date due to a Drizzle bug https://github.com/drizzle-team/drizzle-orm/issues/2009
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.as('s1');

		const s2 = db
			.select({
				startedAt: s1.startedAt,
				endedAt: s1.endedAt,
				memberId: s1.memberId,
				memberName: s1.memberName,
				attendanceId: s1.attendanceId,
				newStart:
					sql<Date>`CASE WHEN ${s1.startedAt} < ${max(s1.le)} OVER (ORDER BY ${s1.startedAt}, ${s1.endedAt}) THEN null ELSE ${s1.startedAt} END`.as(
						'new_start',
					),
			})
			.from(s1)
			.as('s2');

		const s3 = db
			.select({
				startedAt: s2.startedAt,
				endedAt: s2.endedAt,
				memberId: s2.memberId,
				memberName: s2.memberName,
				attendanceId: s2.attendanceId,
				leftEdge: sql<Date>`${max(s2.newStart)} OVER (ORDER BY ${s2.startedAt}, ${s2.endedAt})`.as('left_edge'),
			})
			.from(s2)
			.as('s3');

		// TODO: See if this can be done in a single query
		const [completedMeetings, [pendingMeeting]] = await Promise.all([
			db
				.select({
					attendeeCount: countDistinct(s3.memberId).as('attendee_count'),
					attendees: sql<
						{ memberName: string; memberId: string; attendanceId: string; startedAt: string; endedAt: string }[]
					>`jsonb_agg(jsonb_build_object('memberName', ${s3.memberName}, 'memberId', ${s3.memberId}, 'attendanceId', ${s3.attendanceId}, 'startedAt', ${s3.startedAt}, 'endedAt', ${s3.endedAt}))`.as(
						'attendees',
					),
					startedAt: min(s3.startedAt).as('started_at'),
					endedAt: max(s3.endedAt).as('ended_at'),
				})
				.from(s3)
				.groupBy(s3.leftEdge)
				.orderBy(s3.leftEdge),
			db
				.select({
					attendeeCount: countDistinct(Schema.teamMembers.id).as('attendee_count'),
					startedAt: min(Schema.teamMembers.pendingSignIn).as('started_at'),
				})
				.from(Schema.teamMembers)
				.innerJoin(
					Schema.teams,
					and(
						eq(Schema.teamMembers.teamId, Schema.teams.id),
						eq(Schema.teams.slug, team.slug),
						isNotNull(Schema.teamMembers.pendingSignIn),
					),
				),
		]);

		const result: TeamMeetingSchema[] = completedMeetings.map((row) => {
			const { startedAt, endedAt } = row;

			assert(startedAt, new TypeError('Expected startedAt to be defined'));
			assert(endedAt, new TypeError('Expected endedAt to be defined'));

			return {
				startedAt,
				endedAt,
				attendees: row.attendees.map((attendee) => ({
					member: {
						name: attendee.memberName,
						id: attendee.memberId,
					},
					attendanceId: attendee.attendanceId,
					startedAt: new Date(attendee.startedAt),
					endedAt: new Date(attendee.endedAt),
				})),
				attendeeCount: row.attendeeCount,
			};
		});

		if (pendingMeeting?.startedAt) {
			result.push({
				startedAt: pendingMeeting.startedAt,
				endedAt: undefined,
				attendees: undefined,
				attendeeCount: pendingMeeting.attendeeCount,
			});
		}

		return result;
	}

	async deleteOngoingMeeting(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('delete', team));

		const teamBySlug = db
			.select({ id: Schema.teams.id })
			.from(Schema.teams)
			.where(eq(Schema.teams.slug, team.slug))
			.as('input_team');

		// Ongoing meeting, delete the pending sign in times
		await db.update(Schema.teamMembers).set({ pendingSignIn: null }).where(eq(Schema.teamMembers.id, teamBySlug.id));

		await this.teamMemberEventsService.announceEvent(team, MemberRedisEvent.MemberAttendanceUpdated);
	}

	async deleteFinishedMeeting(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		meeting: TimeRangeSchema,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('delete', team));

		const meetingsToDelete = db.$with('meetings_to_delete').as(
			db
				.select({ id: Schema.memberAttendance.id })
				.from(Schema.memberAttendance)
				.innerJoin(
					Schema.teamMembers,
					and(
						eq(Schema.memberAttendance.memberId, Schema.teamMembers.id),
						gte(Schema.memberAttendance.startedAt, meeting.start),
						lte(Schema.memberAttendance.endedAt, meeting.end),
					),
				)
				.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug))),
		);

		const meetingsToDeleteSubquery = db.select({ id: meetingsToDelete.id }).from(meetingsToDelete);

		await db
			.with(meetingsToDelete)
			.delete(Schema.memberAttendance)
			.where(inArray(Schema.memberAttendance.id, meetingsToDeleteSubquery));

		await this.teamMemberEventsService.announceEvent(team, MemberRedisEvent.MemberAttendanceUpdated);
	}

	async getCurrentMeetingStart(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<Date | undefined> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('viewList', team));

		const [result] = await db
			.select({
				startedAt: min(Schema.teamMembers.pendingSignIn),
			})
			.from(Schema.teamMembers)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)));

		return result?.startedAt ?? undefined;
	}

	async createMeeting(bouncer: AppBouncer, data: CreateTeamMeetingSchema): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('create', data.attendees));

		const uniqueAttendeeIds = new Set(data.attendees.map((attendee) => attendee.id));

		await db.transaction((tx) =>
			Promise.all(
				[...uniqueAttendeeIds].map(async (attendeeId) => {
					await tx.insert(Schema.memberAttendance).values({
						memberId: attendeeId,
						startedAt: data.timeRange.start,
						endedAt: data.timeRange.end,
					});
				}),
			),
		);

		await this.teamMemberEventsService.announceEvent(data.attendees, MemberRedisEvent.MemberAttendanceUpdated);
	}

	async getMeetingsForMember(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
		timeFilter: TimeFilterSchema,
	): Promise<Pick<MeetingAttendeeSchema, 'attendanceId' | 'startedAt' | 'endedAt'>[]> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('viewMeetingsForMembers', [member]),
		);

		const result = await db
			.select({
				attendanceId: Schema.memberAttendance.id,
				startedAt: Schema.memberAttendance.startedAt,
				endedAt: Schema.memberAttendance.endedAt,
			})
			.from(Schema.memberAttendance)
			.where(
				and(
					eq(Schema.memberAttendance.memberId, member.id),
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
				),
			);

		return result.map((row) => ({
			attendanceId: row.attendanceId,
			startedAt: row.startedAt,
			endedAt: row.endedAt,
		}));
	}
}
