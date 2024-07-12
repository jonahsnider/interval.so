import { convert } from 'convert';
import { and, avg, countDistinct, eq, gt, lt, sql, sum } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { UserTimezoneSchema } from '../user/schemas/user_timezone_schema.js';
import type { AverageHoursDatumSchema } from './schemas/average_hours_datum_schema.js';
import { DatumPeriod, timeFilterToDatumPeriod } from './schemas/datum_time_range_schema.js';
import type { TimeFilterSchema } from './schemas/time_filter_schema.js';
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
		timeFilter: TimeFilterSchema,
	): Promise<number> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		// TODO: This either fully includes or fully excludes meetings depending on the time range. If the time range starts/ends when a meeting is in progress, should we include the partial meeting duration?
		// If yes, probably implement by selecting from max(finished_member_meetings.started_at, timeFilter.start) and min(finished_member_meetings.ended_at, timeFilter.end)

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
					gt(Schema.teamMembers.pendingSignIn, timeFilter.start),
					// Since meetings are pending, we don't have an end time, so we act as though they ended now()
					// If the time filter included an end time, we filter via that
					// Need to manually stringify the date due to a Drizzle bug https://github.com/drizzle-team/drizzle-orm/issues/2009
					timeFilter.end && lt(sql<Date>`now()`, timeFilter.end.toISOString()),
				),
			);

		const finishedMeetingDurations = db
			.select({
				durationSeconds:
					sql<number>`EXTRACT(epoch FROM ${Schema.memberAttendance.endedAt} - ${Schema.memberAttendance.startedAt})`.as(
						'duration_seconds',
					),
			})
			.from(Schema.memberAttendance)
			.innerJoin(Schema.teamMembers, and(eq(Schema.teamMembers.id, Schema.memberAttendance.memberId)))
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.where(
				and(
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
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
		timeFilter: TimeFilterSchema,
		displayTimezone: UserTimezoneSchema,
	): Promise<UniqueMembersDatumSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const datumPeriod = timeFilterToDatumPeriod(timeFilter);
		const dateField = TeamStatsService.datumPeriodToPostgresDateField(datumPeriod);
		const interval = `1 ${dateField}`;

		const seriesDate = sql<Date>`series_date`.mapWith((value) => new Date(value));

		const meetingsForTeam = db
			.select({
				memberId: Schema.teamMembers.id,
				startedAt: Schema.memberAttendance.startedAt,
			})
			.from(Schema.memberAttendance)
			.innerJoin(Schema.teamMembers, eq(Schema.teamMembers.id, Schema.memberAttendance.memberId))
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.as('meetings_for_team');

		// We act as though the filter had ended now if it didn't have an end time included
		const seriesEndDate = timeFilter.end ?? new Date();

		const result = await db
			.select({
				groupStart: seriesDate,
				memberCount: countDistinct(meetingsForTeam.memberId).as('member_count'),
			})
			.from(
				sql<Date>`generate_series(date_trunc(${dateField}, ${timeFilter.start.toISOString()}::timestamptz at time zone ${displayTimezone}) at time zone ${displayTimezone}, ${seriesEndDate.toISOString()}::timestamptz, ${interval}::interval, ${displayTimezone}) as series_date`,
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
		timeFilter: TimeFilterSchema,
	): Promise<number> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const [result] = await db
			.select({
				count: countDistinct(Schema.memberAttendance.memberId).as('member_count'),
			})
			.from(Schema.memberAttendance)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.memberAttendance.memberId, Schema.teamMembers.id),
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)));

		return result?.count ?? 0;
	}

	/** Get the average number of hours spent by team members at meetings. */
	async getAverageHoursTimeSeries(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
		displayTimezone: UserTimezoneSchema,
	): Promise<AverageHoursDatumSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const datumPeriod = timeFilterToDatumPeriod(timeFilter);
		const dateField = TeamStatsService.datumPeriodToPostgresDateField(datumPeriod);
		const interval = `1 ${dateField}`;

		const seriesDate = sql<Date>`series_date`.mapWith((value) => new Date(value));

		const meetingsForTeam = db
			.select({
				memberId: Schema.memberAttendance.memberId,
				startedAt: Schema.memberAttendance.startedAt,
				endedAt: Schema.memberAttendance.endedAt,
				durationSeconds:
					sql<number>`EXTRACT(epoch FROM ${Schema.memberAttendance.endedAt} - ${Schema.memberAttendance.startedAt})`.as(
						'duration_seconds',
					),
			})
			.from(Schema.memberAttendance)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.memberAttendance.memberId, Schema.teamMembers.id),
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
			.as('meetings_for_team');

		// TODO: Consider first summing the durations per member, and then averaging those, to avoid very short meetings from a member (ex. accidental sign in/out/in) tanking the average

		// We act as though the filter had ended now if it didn't have an end time included
		const seriesEndDate = timeFilter.end ?? new Date();

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
				sql<Date>`generate_series(date_trunc(${dateField}, ${timeFilter.start.toISOString()}::timestamptz at time zone ${displayTimezone}) at time zone ${displayTimezone}, ${seriesEndDate.toISOString()}::timestamptz, ${interval}::interval, ${displayTimezone}) as series_date`,
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
		timeFilter: TimeFilterSchema,
	): Promise<number> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const [result] = await db
			.select({
				durationSeconds: sql`COALESCE(${avg(
					sql`EXTRACT(epoch FROM ${Schema.memberAttendance.endedAt} - ${Schema.memberAttendance.startedAt})`,
				)}, 0)`
					.mapWith(Number)
					.as('duration_seconds'),
			})
			.from(Schema.memberAttendance)
			.innerJoin(
				Schema.teamMembers,
				and(
					eq(Schema.memberAttendance.memberId, Schema.teamMembers.id),
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
				),
			)
			.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)));

		return convert(result?.durationSeconds ?? 0, 's').to('hour');
	}
}
