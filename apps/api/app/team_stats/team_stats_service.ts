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

		const teamMembersForTeam = db
			.select({ id: Schema.teamMembers.id, pendingSignIn: Schema.teamMembers.pendingSignIn })
			.from(Schema.teamMembers)
			.where(eq(Schema.teamMembers.teamSlug, team.slug))
			.as('team_members_for_team');

		// We add a minute to the end time since asking Postgres to filter using the end time in the range means that it will always be *slightly* after the end time
		// Since requests probably won't take more than a minute to go through, this small adjustment means we don't exclude too many results from Postgres, and don't introduce too much inaccuracy into the result
		const timeRangeEndAdjusted = add(timeRange.end, { minutes: 1 });

		// TODO: This either fully includes or fully excludes meetings depending on the time range. If the time range starts/ends when a meeting is in progress, should we include the partial meeting duration?

		const pendingMeetingDurations = db
			.select({
				durationSeconds: sql`EXTRACT(epoch FROM now() - ${teamMembersForTeam.pendingSignIn})`.as('duration_seconds'),
			})
			.from(teamMembersForTeam)
			.innerJoin(Schema.finishedMemberMeetings, eq(teamMembersForTeam.id, Schema.finishedMemberMeetings.memberId))
			.where(
				and(
					gt(teamMembersForTeam.pendingSignIn, timeRange.start),
					// Need to manually stringify the date due to a Drizzle bug https://github.com/drizzle-team/drizzle-orm/issues/2009
					lt(sql<Date>`now()`, timeRangeEndAdjusted.toISOString()),
				),
			);

		const finishedMeetingDurations = db
			.select({
				durationSeconds:
					sql`EXTRACT(epoch FROM ${Schema.finishedMemberMeetings.endedAt} - ${Schema.finishedMemberMeetings.startedAt})`.as(
						'duration_seconds',
					),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(teamMembersForTeam, eq(Schema.finishedMemberMeetings.memberId, teamMembersForTeam.id))
			.where(
				and(
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
				),
			);

		const allDurations = unionAll(pendingMeetingDurations, finishedMeetingDurations).as('all_durations');

		const [result] = await db
			.select({
				durationSeconds: sum(allDurations.durationSeconds),
			})
			.from(allDurations);

		if (!result?.durationSeconds) {
			return 0;
		}

		return convert(Number(result.durationSeconds), 'seconds').to('hours');
	}
}
