import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamService } from '../team/team_service.js';
import type { UserSchema } from '../user/schemas/user_schema.js';

@inject()
@injectHelper(TeamService)
export default class UserPolicy extends BasePolicy {
	constructor(private readonly teamService: TeamService) {
		super();
	}

	read(actor: BouncerUser, user: Pick<UserSchema, 'id'>): AuthorizerResponse {
		return actor.id === user.id;
	}

	update(actor: BouncerUser, user: Pick<UserSchema, 'id'>): AuthorizerResponse {
		return actor.id === user.id;
	}

	async delete(actor: BouncerUser, user: Pick<UserSchema, 'id'>): Promise<AuthorizerResponse> {
		if (actor.id !== user.id) {
			return false;
		}

		const isTeamOwner = await this.teamService.internalIsAnyTeamOwner(actor);

		// If you own a team you can't delete your account, need to transfer ownership first
		return !isTeamOwner;
	}
}
