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
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import type { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import type { TeamMeetingSchema } from './schemas/team_meeting_schema.js';

@inject()
@injectHelper(TeamMemberEventsService)
export class MeetingService {
	constructor(private readonly teamMemberEventsService: TeamMemberEventsService) {}

	async getMeetings(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
	): Promise<TeamMeetingSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('viewList', team));

		// The giant query for grouping the overlapping sign-ins is from https://wiki.postgresql.org/wiki/Range_aggregation
		const s1 = db
			.select({
				startedAt: Schema.finishedMemberMeetings.startedAt,
				endedAt: Schema.finishedMemberMeetings.endedAt,
				memberId: Schema.finishedMemberMeetings.memberId,
				le: sql<Date>`lag(${Schema.finishedMemberMeetings.endedAt}) OVER (ORDER BY ${Schema.finishedMemberMeetings.startedAt}, ${Schema.finishedMemberMeetings.endedAt})`.as(
					'le',
				),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.finishedMemberMeetings.memberId, Schema.teamMembers.id),
					gt(Schema.finishedMemberMeetings.startedAt, timeFilter.start),
					// Need to manually stringify the date due to a Drizzle bug https://github.com/drizzle-team/drizzle-orm/issues/2009
					timeFilter.end && lt(Schema.finishedMemberMeetings.endedAt, timeFilter.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.as('s1');

		const s2 = db
			.select({
				startedAt: s1.startedAt,
				endedAt: s1.endedAt,
				memberId: s1.memberId,
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
				leftEdge: sql<Date>`${max(s2.newStart)} OVER (ORDER BY ${s2.startedAt}, ${s2.endedAt})`.as('left_edge'),
			})
			.from(s2)
			.as('s3');

		// TODO: See if this can be done in a single query
		const [completedMeetings, [pendingMeeting]] = await Promise.all([
			db
				.select({
					memberCount: countDistinct(s3.memberId).as('member_count'),
					startedAt: min(s3.startedAt).as('started_at'),
					endedAt: max(s3.endedAt).as('ended_at'),
				})
				.from(s3)
				.groupBy(s3.leftEdge),
			db
				.select({
					memberCount: countDistinct(Schema.teamMembers.id).as('member_count'),
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

		const result = completedMeetings.map((row) => {
			const { startedAt } = row;

			assert(startedAt, new TypeError('Expected startedAt to be defined'));

			return {
				startedAt,
				endedAt: row.endedAt ?? undefined,
				attendeeCount: row.memberCount,
			};
		});

		if (pendingMeeting?.startedAt) {
			result.push({
				startedAt: pendingMeeting.startedAt,
				endedAt: undefined,
				attendeeCount: pendingMeeting.memberCount,
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
				.select({ id: Schema.finishedMemberMeetings.id })
				.from(Schema.finishedMemberMeetings)
				.innerJoin(
					Schema.teamMembers,
					and(
						eq(Schema.finishedMemberMeetings.memberId, Schema.teamMembers.id),
						gte(Schema.finishedMemberMeetings.startedAt, meeting.start),
						lte(Schema.finishedMemberMeetings.endedAt, meeting.end),
					),
				)
				.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug))),
		);

		const meetingsToDeleteSubquery = db.select({ id: meetingsToDelete.id }).from(meetingsToDelete);

		await db
			.with(meetingsToDelete)
			.delete(Schema.finishedMemberMeetings)
			.where(inArray(Schema.finishedMemberMeetings.id, meetingsToDeleteSubquery));

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
}
