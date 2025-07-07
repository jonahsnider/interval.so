import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import { match, P } from 'ts-pattern';
import type { TeamManagerRole } from '#database/schema';
import type { AppBouncer, BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { rolesThatCanManageOther, type TeamManagerSchema } from '../team_manager/schemas/team_manager_schema.js';
import { TeamManagerService } from '../team_manager/team_manager_service.js';
import type { UserSchema } from '../user/schemas/user_schema.js';

@inject()
@injectHelper(AuthorizationService, TeamManagerService)
export default class TeamPolicy extends BasePolicy {
	constructor(
		private readonly authorizationService: AuthorizationService,
		private readonly teamManagerService: TeamManagerService,
	) {
		super();
	}

	viewInsights(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}

	viewInviteUrl(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin']);
	}

	resetInviteUrl(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin']);
	}

	viewSettings(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}

	updateSettings(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin']);
	}

	async updateUserRole(
		actor: BouncerUser,
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		targetUser: Pick<UserSchema, 'id'>,
		change: Pick<TeamManagerSchema, 'role'>,
	): Promise<AuthorizerResponse> {
		const targetUserRole = await this.teamManagerService.getUserRole(bouncer, team, targetUser);

		/** The roles allowed to perform this operation, or `false` if the operation is not allowed no matter what. */
		const allowedRolesOrFalse: false | TeamManagerRole[] = match({
			from: targetUserRole.role,
			to: change.role,
		})
			// Owners can't be modified
			.with({ from: 'owner', to: P.any }, (): false => false)
			// An owner can make anyone into an owner or an admin
			.with({ from: P.any, to: P.union('owner', 'admin') }, (): TeamManagerRole[] => ['owner'])
			// Only owner can manage admins
			.with({ from: 'admin', to: P.any }, (): TeamManagerRole[] => ['owner'])
			// Owners & admins can manage editors
			.with({ from: 'editor', to: 'editor' }, (): TeamManagerRole[] => ['owner', 'admin'])
			.exhaustive();

		if (allowedRolesOrFalse === false) {
			return false;
		}

		return this.authorizationService.hasRoles(actor, team, allowedRolesOrFalse);
	}

	async removeUser(
		actor: BouncerUser,
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		targetUser: Pick<UserSchema, 'id'>,
	): Promise<AuthorizerResponse> {
		const targetUserRole = await this.teamManagerService.getUserRole(bouncer, team, targetUser);

		const allowedRoles = rolesThatCanManageOther(targetUserRole);

		return this.authorizationService.hasRoles(actor, team, allowedRoles);
	}

	delete(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): Promise<AuthorizerResponse> {
		return this.authorizationService.hasRoles(actor, team, ['owner']);
	}
}
