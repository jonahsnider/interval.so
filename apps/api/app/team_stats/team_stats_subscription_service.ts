import { inject } from '@adonisjs/core';
import { concat, filter, from, mergeMap, type Observable } from 'rxjs';
import { injectHelper } from '../../util/inject_helper.ts';
import type { TeamSchema } from '../team/schemas/team_schema.ts';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.ts';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.ts';
import type { UserTimezoneSchema } from '../user/schemas/user_timezone_schema.ts';
import type { AverageHoursDatumSchema } from './schemas/average_hours_datum_schema.ts';
import type { TimeFilterSchema } from './schemas/time_filter_schema.ts';
import type { UniqueMembersDatumSchema } from './schemas/unique_members_datum_schema.ts';
import { TeamStatsService } from './team_stats_service.ts';
import { type Actor, assertTeamRole } from '../authorization/authorization.ts';

@inject()
@injectHelper(TeamStatsService, TeamMemberEventsService)
export class TeamStatsSubscriptionService {
	constructor(
		private readonly teamStatsService: TeamStatsService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async combinedHoursSubscribe(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
	): Promise<Observable<number>> {
		await assertTeamRole(actor, team, 'editor');

		const memberChanges = await this.eventsService.subscribeForTeam(actor, team);

		return concat(
			from(this.teamStatsService.getCombinedHours(actor, team, timeFilter)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getCombinedHours(actor, team, timeFilter))),
			),
		);
	}

	async averageHoursTimeSeriesSubscribe(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
		timezone: UserTimezoneSchema,
	): Promise<Observable<AverageHoursDatumSchema[]>> {
		await assertTeamRole(actor, team, 'editor');

		const memberChanges = await this.eventsService.subscribeForTeam(actor, team);

		return concat(
			from(this.teamStatsService.getAverageHoursTimeSeries(actor, team, timeFilter, timezone)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getAverageHoursTimeSeries(actor, team, timeFilter, timezone))),
			),
		);
	}

	async uniqueMembersTimeSeriesSubscribe(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
		timezone: UserTimezoneSchema,
	): Promise<Observable<UniqueMembersDatumSchema[]>> {
		await assertTeamRole(actor, team, 'editor');

		const memberChanges = await this.eventsService.subscribeForTeam(actor, team);

		return concat(
			from(this.teamStatsService.getUniqueMembersTimeSeries(actor, team, timeFilter, timezone)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getUniqueMembersTimeSeries(actor, team, timeFilter, timezone))),
			),
		);
	}
}
