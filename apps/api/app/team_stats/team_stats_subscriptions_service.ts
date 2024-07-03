import { inject } from '@adonisjs/core';
import { type Observable, concat, filter, from, map, mergeMap } from 'rxjs';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { TimeRangeSchema } from './schemas/time_range_schema.js';
import { TeamStatsService } from './team_stats_service.js';

@inject()
@injectHelper(TeamStatsService, TeamMemberEventsService)
export class TeamStatsSubscriptionsService {
	constructor(
		private readonly teamStatsService: TeamStatsService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async combinedHoursSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<Observable<number>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInsights', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			from(this.teamStatsService.getCombinedHours(bouncer, team, timeRange)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.teamStatsService.getCombinedHours(bouncer, team, timeRange))),
				map(() => Math.random()),
			),
		);
	}
}
