import { inject } from '@adonisjs/core';
import { type Observable, concat, from, mergeMap } from 'rxjs';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamMemberEventsService } from './events/team_member_events_service.js';
import type { SimpleTeamMemberSchema, TeamMemberSchema } from './schemas/team_member_schema.js';
import { TeamMemberService } from './team_member_service.js';

@inject()
@injectHelper(TeamMemberService, TeamMemberEventsService)
export class TeamMemberSubscriptionService {
	constructor(
		private readonly teamMemberService: TeamMemberService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async simpleTeamMemberListSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Observable<SimpleTeamMemberSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team));
		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			// Emit one event on subscribe
			from(this.teamMemberService.getTeamMembersSimple(bouncer, team)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.teamMemberService.getTeamMembersSimple(bouncer, team)))),
		);
	}

	async fullTeamMemberListSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Observable<TeamMemberSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewFullMemberList', team));
		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			// Emit one event on subscribe
			from(this.teamMemberService.getTeamMembersFull(bouncer, team)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.teamMemberService.getTeamMembersFull(bouncer, team)))),
		);
	}
}
