import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import type { AttendanceEntrySchema } from '../team_member_attendance/schemas/attendance_entry_schema.js';

@inject()
@injectHelper(AuthorizationService)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TeamMemberAttendancePolicy extends BasePolicy {
	constructor(private readonly authorizationService: AuthorizationService) {
		super();
	}

	viewEntriesForMembers(actor: BouncerUser, teamMembers: Pick<TeamMemberSchema, 'id'>[]): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRolesByTeamMembers(actor, teamMembers, ['admin', 'owner', 'editor']);
	}

	deleteEntries(
		actor: BouncerUser,
		entries: Pick<AttendanceEntrySchema, 'attendanceId'>[],
	): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRolesByMeetingIds(actor, entries, ['owner', 'admin', 'editor']);
	}

	createEntryForMembers(actor: BouncerUser, data: Pick<TeamMemberSchema, 'id'>[]): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRolesByTeamMembers(actor, data, ['owner', 'admin', 'editor']);
	}

	updateEntries(actor: BouncerUser, data: Pick<AttendanceEntrySchema, 'attendanceId'>[]): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRolesByMeetingIds(actor, data, ['owner', 'admin', 'editor']);
	}

	mergeEntries(actor: BouncerUser, data: Pick<AttendanceEntrySchema, 'attendanceId'>[]): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRolesByMeetingIds(actor, data, ['owner', 'admin', 'editor']);
	}
}
