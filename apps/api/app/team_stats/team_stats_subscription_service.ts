import { inject } from '@adonisjs/core';
import { concat, filter, from, mergeMap, type Observable } from 'rxjs';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { UserTimezoneSchema } from '../user/schemas/user_timezone_schema.js';
import type { AverageHoursDatumSchema } from './schemas/average_hours_datum_schema.js';
import type { TimeFilterSchema } from './schemas/time_filter_schema.js';
import type { UniqueMembersDatumSchema } from './schemas/unique_members_datum_schema.js';
import { TeamStatsService } from './team_stats_service.js';

@inject()
@injectHelper(TeamStatsService, TeamMemberEventsService)
export class TeamStatsSubscriptionService {
	constructor(
		private readonly teamStatsService: TeamStatsService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async combinedHoursSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
	): Promise<Observable<number>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			from(this.teamStatsService.getCombinedHours(bouncer, team, timeFilter)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getCombinedHours(bouncer, team, timeFilter))),
			),
		);
	}

	async averageHoursTimeSeriesSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
		timezone: UserTimezoneSchema,
	): Promise<Observable<AverageHoursDatumSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			from(this.teamStatsService.getAverageHoursTimeSeries(bouncer, team, timeFilter, timezone)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getAverageHoursTimeSeries(bouncer, team, timeFilter, timezone))),
			),
		);
	}

	async uniqueMembersTimeSeriesSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
		timezone: UserTimezoneSchema,
	): Promise<Observable<UniqueMembersDatumSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			from(this.teamStatsService.getUniqueMembersTimeSeries(bouncer, team, timeFilter, timezone)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getUniqueMembersTimeSeries(bouncer, team, timeFilter, timezone))),
			),
		);
	}
}
