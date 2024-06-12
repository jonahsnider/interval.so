import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TeamMemberSchema } from './schemas/team_member_schema.js';

@inject()
@injectHelper(AuthorizationService)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TeamMemberPolicy extends BasePolicy {
	constructor(private readonly authorizationService: AuthorizationService) {
		super();
	}

	create(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['admin', 'owner']);
	}

	readSimple(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['admin', 'owner', 'guestToken']);
	}

	readFull(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['admin', 'owner']);
	}

	update(actor: BouncerUser, teamMember: Pick<TeamMemberSchema, 'id'>): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMember(actor, teamMember, ['admin', 'owner']);
	}

	updateAttendance(actor: BouncerUser, teamMember: Pick<TeamMemberSchema, 'id'>): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMember(actor, teamMember, ['admin', 'owner', 'guestToken']);
	}

	delete(actor: BouncerUser, teamMember: Pick<TeamMemberSchema, 'id'>): AuthorizerResponse {
		return this.authorizationService.hasRolesByTeamMember(actor, teamMember, ['admin', 'owner']);
	}
}
