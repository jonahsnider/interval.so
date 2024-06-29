import { convert } from 'convert';
import { add } from 'date-fns';
import { and, avg, countDistinct, eq, gt, lt, sql, sum } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { UserTimezoneSchema } from '../user/schemas/user_timezone_schema.js';
import type { AverageHoursDatumSchema } from './schemas/average_hours_datum_schema.js';
import { DatumPeriod, timeRangeToDatumPeriod } from './schemas/datum_time_range_schema.js';
import type { TimeRangeSchema } from './schemas/time_range_schema.js';
import type { UniqueMembersDatumSchema } from './schemas/unique_members_datum_schema.js';

export class TeamStatsService {
	private static datumPeriodToPostgresDateField(datumPeriod: DatumPeriod): string {
		switch (datumPeriod) {
			case DatumPeriod.Daily:
				return 'day';
			case DatumPeriod.Weekly:
				return 'week';
			case DatumPeriod.Monthly:
				return 'month';
		}
	}

	async getCombinedHours(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<number> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

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
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.where(
				and(
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
			.innerJoin(Schema.teamMembers, and(eq(Schema.teamMembers.id, Schema.finishedMemberMeetings.memberId)))
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
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

	/**
	 * Used for display a graph of unique members over a timespan.
	 */
	async getUniqueMembersTimeSeries(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
		displayTimezone: UserTimezoneSchema,
	): Promise<UniqueMembersDatumSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const datumPeriod = timeRangeToDatumPeriod(timeRange);
		const dateField = TeamStatsService.datumPeriodToPostgresDateField(datumPeriod);
		const interval = `1 ${dateField}`;

		const seriesDate = sql<Date>`series_date`.mapWith((value) => new Date(value));

		const meetingsForTeam = db
			.select({
				memberId: Schema.teamMembers.id,
				startedAt: Schema.finishedMemberMeetings.startedAt,
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(Schema.teamMembers, eq(Schema.teamMembers.id, Schema.finishedMemberMeetings.memberId))
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.as('meetings_for_team');

		const result = await db
			.select({
				groupStart: seriesDate,
				memberCount: countDistinct(meetingsForTeam.memberId).as('member_count'),
			})
			.from(
				sql<Date>`generate_series(date_trunc(${dateField}, ${timeRange.start.toISOString()}::timestamptz at time zone ${displayTimezone}) at time zone ${displayTimezone}, ${timeRange.end.toISOString()}::timestamptz, ${interval}::interval, ${displayTimezone}) as series_date`,
			)
			.leftJoin(
				meetingsForTeam,
				eq(
					sql<Date>`date_trunc(${dateField}, ${meetingsForTeam.startedAt} at time zone ${displayTimezone}) at time zone ${displayTimezone}`,
					seriesDate,
				),
			)
			.leftJoin(Schema.teamMembers, eq(meetingsForTeam.memberId, Schema.teamMembers.id))
			.groupBy(seriesDate);

		return result.map((row) => ({ date: row.groupStart, memberCount: row.memberCount }));
	}

	/**
	 * Get the total number of unique members within a timespan.
	 */
	async getUniqueMembersSimple(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<number> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const [result] = await db
			.select({
				count: countDistinct(Schema.finishedMemberMeetings.memberId).as('member_count'),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.finishedMemberMeetings.memberId, Schema.teamMembers.id),
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)));

		return result?.count ?? 0;
	}

	/** Get the average number of hours spent by team members at meetings. */
	async getAverageHoursTimeSeries(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
		displayTimezone: UserTimezoneSchema,
	): Promise<AverageHoursDatumSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const datumPeriod = timeRangeToDatumPeriod(timeRange);
		const dateField = TeamStatsService.datumPeriodToPostgresDateField(datumPeriod);
		const interval = `1 ${dateField}`;

		const seriesDate = sql<Date>`series_date`.mapWith((value) => new Date(value));

		const meetingsForTeam = db
			.select({
				memberId: Schema.finishedMemberMeetings.memberId,
				startedAt: Schema.finishedMemberMeetings.startedAt,
				endedAt: Schema.finishedMemberMeetings.endedAt,
				durationSeconds:
					sql<number>`EXTRACT(epoch FROM ${Schema.finishedMemberMeetings.endedAt} - ${Schema.finishedMemberMeetings.startedAt})`.as(
						'duration_seconds',
					),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.finishedMemberMeetings.memberId, Schema.teamMembers.id),
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.as('meetings_for_team');

		// TODO: Consider first summing the durations per member, and then averaging those, to avoid very short meetings from a member (ex. accidental sign in/out/in) tanking the average

		const result = await db
			.select({
				groupStart: seriesDate,
				durationSeconds: sql`COALESCE(${avg(
					sql`EXTRACT(epoch FROM ${meetingsForTeam.endedAt} - ${meetingsForTeam.startedAt})`,
				)}, 0)`
					.mapWith(Number)
					.as('duration_seconds'),
			})
			.from(
				sql<Date>`generate_series(date_trunc(${dateField}, ${timeRange.start.toISOString()}::timestamptz at time zone ${displayTimezone}) at time zone ${displayTimezone}, ${timeRange.end.toISOString()}::timestamptz, ${interval}::interval, ${displayTimezone}) as series_date`,
			)
			.leftJoin(
				meetingsForTeam,
				eq(
					sql<Date>`date_trunc(${dateField}, ${meetingsForTeam.startedAt} at time zone ${displayTimezone}) at time zone ${displayTimezone}`,
					seriesDate,
				),
			)
			.leftJoin(Schema.teamMembers, eq(meetingsForTeam.memberId, Schema.teamMembers.id))
			.groupBy(seriesDate)
			.orderBy(seriesDate);

		return result.map((row) => ({
			date: row.groupStart,
			averageHours: convert(row.durationSeconds, 's').to('hour'),
		}));
	}

	async getAverageHoursSimple(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<number> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const [result] = await db
			.select({
				durationSeconds: sql`COALESCE(${avg(
					sql`EXTRACT(epoch FROM ${Schema.finishedMemberMeetings.endedAt} - ${Schema.finishedMemberMeetings.startedAt})`,
				)}, 0)`
					.mapWith(Number)
					.as('duration_seconds'),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.finishedMemberMeetings.memberId, Schema.teamMembers.id),
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)));

		return convert(result?.durationSeconds ?? 0, 's').to('hour');
	}
}
