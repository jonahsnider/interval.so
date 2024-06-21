import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { and, count, eq, gt, gte, inArray, isNotNull, lt, lte, max, min, sql } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import type { TeamMeetingSchema } from './schemas/team_meeting_schema.js';

export class TeamMeetingService {
	async getMeetings(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<TeamMeetingSchema[]> {
		assert(await bouncer.with('TeamPolicy').allows('read', team), new TRPCError({ code: 'FORBIDDEN' }));

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
					eq(Schema.teamMembers.teamSlug, team.slug),
				),
			)
			.where(
				and(
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					// Need to manually stringify the date due to a Drizzle bug https://github.com/drizzle-team/drizzle-orm/issues/2009
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
				),
			)
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
					memberCount: count(s3.memberId).as('member_count'),
					startedAt: min(s3.startedAt).as('started_at'),
					endedAt: max(s3.endedAt).as('ended_at'),
				})
				.from(s3)
				.groupBy(s3.leftEdge),
			db
				.select({
					memberCount: count(Schema.teamMembers.id).as('member_count'),
					startedAt: min(Schema.teamMembers.pendingSignIn).as('started_at'),
				})
				.from(Schema.teamMembers)
				.where(and(eq(Schema.teamMembers.teamSlug, team.slug), isNotNull(Schema.teamMembers.pendingSignIn))),
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

	async deleteOngoingMeeting(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>) {
		await bouncer.with('TeamPolicy').allows('update', team);

		// Ongoing meeting, delete the pending sign in times
		await db.update(Schema.teamMembers).set({ pendingSignIn: null }).where(eq(Schema.teamMembers.teamSlug, team.slug));
	}

	async deleteFinishedMeeting(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		meeting: TimeRangeSchema,
	): Promise<void> {
		assert(await bouncer.with('TeamPolicy').allows('update', team), new TRPCError({ code: 'FORBIDDEN' }));

		const meetingsToDelete = db.$with('meetings_to_delete').as(
			db
				.select({ id: Schema.finishedMemberMeetings.id })
				.from(Schema.finishedMemberMeetings)
				.innerJoin(
					Schema.teamMembers,
					and(
						eq(Schema.finishedMemberMeetings.memberId, Schema.teamMembers.id),
						eq(Schema.teamMembers.teamSlug, team.slug),
						gte(Schema.finishedMemberMeetings.startedAt, meeting.start),
						lte(Schema.finishedMemberMeetings.endedAt, meeting.end),
					),
				),
		);

		const meetingsToDeleteSubquery = db.select({ id: meetingsToDelete.id }).from(meetingsToDelete);

		await db
			.with(meetingsToDelete)
			.delete(Schema.finishedMemberMeetings)
			.where(inArray(Schema.finishedMemberMeetings.id, meetingsToDeleteSubquery));
	}
}
