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
export default class MeetingPolicy extends BasePolicy {
	constructor(private readonly authorizationService: AuthorizationService) {
		super();
	}

	viewList(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}

	create(actor: BouncerUser, attendees: Pick<TeamMemberSchema, 'id'>[]): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRolesByTeamMembers(actor, attendees, ['owner', 'admin', 'editor']);
	}

	delete(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}
}
