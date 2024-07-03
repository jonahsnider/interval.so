import { inject } from '@adonisjs/core';
import { type Observable, concat, filter, from, mergeMap } from 'rxjs';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import { MeetingService } from './meeting_service.js';
import type { TeamMeetingSchema } from './schemas/team_meeting_schema.js';

@inject()
@injectHelper(TeamMemberEventsService, MeetingService)
export class MeetingSubscriptionService {
	constructor(
		private readonly eventsService: TeamMemberEventsService,
		private readonly meetingService: MeetingService,
	) {}

	async meetingsSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<Observable<TeamMeetingSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('MeetingPolicy').allows('viewList', team));

		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			// Emit one event on subscribe
			from(this.meetingService.getMeetings(bouncer, team, timeRange)),
			memberChanges.pipe(
				filter(
					(event) =>
						event === MemberRedisEvent.MemberCreated ||
						event === MemberRedisEvent.MemberDeleted ||
						event === MemberRedisEvent.MemberAttendanceUpdated,
				),
				mergeMap(() => from(this.meetingService.getMeetings(bouncer, team, timeRange))),
			),
		);
	}
}
