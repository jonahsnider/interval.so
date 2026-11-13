import { inject } from '@adonisjs/core';
import { concat, filter, from, mergeMap, type Observable } from 'rxjs';
import { injectHelper } from '../../util/inject_helper.ts';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.ts';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.ts';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.ts';
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.ts';
import type { AttendanceEntrySchema } from './schemas/attendance_entry_schema.ts';
import { TeamMemberAttendanceService } from './team_member_attendance_service.ts';
import { type Actor, assertTeamRoleForMembers } from '../authorization/authorization.ts';

@inject()
@injectHelper(TeamMemberAttendanceService, TeamMemberEventsService)
/** Class names are starting to get pretty long... */
export class TeamMemberAttendanceSubscriptionService {
	constructor(
		private readonly attendanceService: TeamMemberAttendanceService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async entriesForMemberSubscribe(
		actor: Actor,
		member: Pick<TeamMemberSchema, 'id'>,
		timeFilter: TimeFilterSchema,
	): Promise<Observable<Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>[]>> {
		await assertTeamRoleForMembers(actor, [member], 'editor');

		const memberChanges = await this.eventsService.subscribeForTeamByMember(actor, member);

		return concat(
			// Emit one event on subscribe
			from(this.attendanceService.getEntriesForMember(actor, member, timeFilter)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(
				filter((event) => event === MemberRedisEvent.MemberAttendanceUpdated),
				mergeMap(() => from(this.attendanceService.getEntriesForMember(actor, member, timeFilter))),
			),
		);
	}
}
