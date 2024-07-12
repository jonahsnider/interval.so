import { inject } from '@adonisjs/core';
import { type Observable, concat, filter, from, mergeMap } from 'rxjs';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import type { AttendanceEntrySchema } from './schemas/attendance_entry_schema.js';
import { TeamMemberAttendanceService } from './team_member_attendance_service.js';

@inject()
@injectHelper(TeamMemberAttendanceService, TeamMemberEventsService)
/** Class names are starting to get pretty long... */
export class TeamMemberAttendanceSubscriptionService {
	constructor(
		private readonly attendanceService: TeamMemberAttendanceService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async entriesForMemberSubscribe(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
		timeFilter: TimeFilterSchema,
	): Promise<Observable<Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>[]>> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberAttendancePolicy').allows('viewEntriesForMembers', [member]),
		);

		const memberChanges = await this.eventsService.subscribeForTeamByMember(bouncer, member);

		return concat(
			// Emit one event on subscribe
			from(this.attendanceService.getEntriesForMember(bouncer, member, timeFilter)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(
				filter((event) => event === MemberRedisEvent.MemberAttendanceUpdated),
				mergeMap(() => from(this.attendanceService.getEntriesForMember(bouncer, member, timeFilter))),
			),
		);
	}
}
