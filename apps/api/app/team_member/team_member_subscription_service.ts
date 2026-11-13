import { inject } from '@adonisjs/core';
import { concat, from, mergeMap, type Observable } from 'rxjs';
import { injectHelper } from '../../util/inject_helper.ts';
import type { TeamSchema } from '../team/schemas/team_schema.ts';
import { TeamMemberEventsService } from './events/team_member_events_service.ts';
import type { SimpleTeamMemberSchema, TeamMemberSchema } from './schemas/team_member_schema.ts';
import { TeamMemberService } from './team_member_service.ts';
import { type Actor, assertTeamRole, assertTeamRoleForMembers } from '../authorization/authorization.ts';

@inject()
@injectHelper(TeamMemberService, TeamMemberEventsService)
export class TeamMemberSubscriptionService {
	constructor(
		private readonly teamMemberService: TeamMemberService,
		private readonly eventsService: TeamMemberEventsService,
	) {}

	async simpleTeamMemberListSubscribe(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Observable<SimpleTeamMemberSchema[]>> {
		await assertTeamRole(actor, team, 'guest');
		const memberChanges = await this.eventsService.subscribeForTeam(actor, team);

		return concat(
			// Emit one event on subscribe
			from(this.teamMemberService.getTeamMembersSimple(actor, team)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.teamMemberService.getTeamMembersSimple(actor, team)))),
		);
	}

	async getMemberSubscription(
		actor: Actor,
		member: Pick<TeamMemberSchema, 'id'>,
	): Promise<Observable<Pick<TeamMemberSchema, 'archived' | 'lastSeenAt' | 'name'>>> {
		await assertTeamRoleForMembers(actor, [member], 'editor');
		const memberChanges = await this.eventsService.subscribeForTeamByMember(actor, member);

		return concat(
			// Emit one event on subscribe
			from(this.teamMemberService.getMember(actor, member)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.teamMemberService.getMember(actor, member)))),
		);
	}

	async fullTeamMemberListSubscribe(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Observable<TeamMemberSchema[]>> {
		await assertTeamRole(actor, team, 'editor');
		const memberChanges = await this.eventsService.subscribeForTeam(actor, team);

		return concat(
			// Emit one event on subscribe
			from(this.teamMemberService.getTeamMembersFull(actor, team)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.teamMemberService.getTeamMembersFull(actor, team)))),
		);
	}
}
