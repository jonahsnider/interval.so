import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { convert } from 'convert';
import { add } from 'date-fns';
import { and, eq, gt, lt, sql, sum } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TimeRangeSchema } from './schemas/time_range_schema.js';

export class TeamStatsService {
	async getCombinedHours(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<number> {
		assert(await bouncer.with('TeamPolicy').allows('read', team), new TRPCError({ code: 'FORBIDDEN' }));

		// We add a minute to the end time since asking Postgres to filter using the end time in the range means that it will always be *slightly* after the end time
		// Since requests probably won't take more than a minute to go through, this small adjustment means we don't exclude too many results from Postgres, and don't introduce too much inaccuracy into the result
		const timeRangeEndAdjusted = add(timeRange.end, { minutes: 1 });

		// TODO: This either fully includes or fully excludes meetings depending on the time range. If the time range starts/ends when a meeting is in progress, should we include the partial meeting duration?
    // If yes, probably implement by selecting from max(finished_member_meetings.started_at, timeRange.start) and min(finished_member_meetings.ended_at, timeRange.end)

		const pendingMeetingDurations = db
			.select({
				durationSeconds: sql<number>`EXTRACT(epoch FROM now() - ${Schema.teamMembers.pendingSignIn})`.as(
					'duration_seconds',
				),
			})
			.from(Schema.teamMembers)
			.where(
				and(
					eq(Schema.teamMembers.teamSlug, team.slug),
					gt(Schema.teamMembers.pendingSignIn, timeRange.start),
					// Need to manually stringify the date due to a Drizzle bug https://github.com/drizzle-team/drizzle-orm/issues/2009
					lt(sql<Date>`now()`, timeRangeEndAdjusted.toISOString()),
				),
			);

		const finishedMeetingDurations = db
			.select({
				durationSeconds:
					sql<number>`EXTRACT(epoch FROM ${Schema.finishedMemberMeetings.endedAt} - ${Schema.finishedMemberMeetings.startedAt})`.as(
						'duration_seconds',
					),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.teamMembers.id, Schema.finishedMemberMeetings.memberId),
					eq(Schema.teamMembers.teamSlug, team.slug),
				),
			)
			.where(
				and(
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
				),
			);

		const allDurations = unionAll(pendingMeetingDurations, finishedMeetingDurations).as('all_durations');

		const [result] = await db
			.select({
				durationSeconds: sum(allDurations.durationSeconds).mapWith(Number),
			})
			.from(allDurations);

		if (!result?.durationSeconds) {
			return 0;
		}

		return convert(result.durationSeconds, 'seconds').to('hours');
	}
}
