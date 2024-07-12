import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';

@inject()
@injectHelper(AuthorizationService)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TeamMemberPolicy extends BasePolicy {
	constructor(private readonly authorizationService: AuthorizationService) {
		super();
	}

	create(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['admin', 'owner', 'editor', 'guestToken']);
	}

	viewSimpleMemberList(
		actor: BouncerUser,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
	): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['admin', 'owner', 'editor', 'guestToken']);
	}

	updateAttendance(actor: BouncerUser, teamMember: Pick<TeamMemberSchema, 'id'>): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMembers(
			actor,
			[teamMember],
			['admin', 'owner', 'editor', 'guestToken'],
		);
	}

	viewFullMemberList(actor: BouncerUser, team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}

	view(actor: BouncerUser, teamMembers: Pick<TeamMemberSchema, 'id'>[]): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMembers(actor, teamMembers, ['admin', 'owner', 'editor']);
	}

	update(actor: BouncerUser, teamMembers: Pick<TeamMemberSchema, 'id'>[]): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMembers(actor, teamMembers, ['admin', 'owner', 'editor']);
	}

	delete(actor: BouncerUser, teamMembers: Pick<TeamMemberSchema, 'id'>[]): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMembers(actor, teamMembers, ['admin', 'owner', 'editor']);
	}

	signOutAll(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}
}
