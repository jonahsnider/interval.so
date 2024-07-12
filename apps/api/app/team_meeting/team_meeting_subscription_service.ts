import { inject } from '@adonisjs/core';
import { type Observable, concat, filter, from, mergeMap } from 'rxjs';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import type { TeamMeetingSchema } from './schemas/team_meeting_schema.js';
import { TeamMeetingService } from './team_meeting_service.js';

@inject()
@injectHelper(TeamMemberEventsService, TeamMeetingService)
export class TeamMeetingSubscriptionService {
	constructor(
		private readonly eventsService: TeamMemberEventsService,
		private readonly meetingService: TeamMeetingService,
	) {}

	async meetingsSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeFilter: TimeFilterSchema,
	): Promise<Observable<TeamMeetingSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('viewList', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			// Emit one event on subscribe
			from(this.meetingService.getMeetings(bouncer, team, timeFilter)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.meetingService.getMeetings(bouncer, team, timeFilter))),
			),
		);
	}

	async currentMeetingStartSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Observable<Date | undefined>> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('viewList', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			// Emit one event on subscribe
			from(this.meetingService.getCurrentMeetingStart(bouncer, team)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.meetingService.getCurrentMeetingStart(bouncer, team)))),
		);
	}
}
