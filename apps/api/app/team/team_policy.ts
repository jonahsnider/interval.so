import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from './schemas/team_schema.js';

@inject()
@injectHelper(AuthorizationService)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TeamPolicy extends BasePolicy {
	constructor(private readonly authorizationService: AuthorizationService) {
		super();
	}

	update(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['admin', 'owner']);
	}

	delete(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner']);
	}
}
