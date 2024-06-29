import { BasePolicy } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import { inject } from '@adonisjs/core';
import { P, match } from 'ts-pattern';
import type { TeamUserRole } from '#database/schema';
import type { AppBouncer, BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { type TeamUserSchema, rolesThatCanManageOther } from '../team_user/schemas/team_user_schema.js';
import { TeamUserService } from '../team_user/team_user_service.js';

@inject()
@injectHelper(AuthorizationService, TeamUserService)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TeamPolicy extends BasePolicy {
	constructor(
		private readonly authorizationService: AuthorizationService,
		private readonly teamUserService: TeamUserService,
	) {
		super();
	}

	viewInsights(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin']);
	}

	viewInviteUrl(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin']);
	}

	resetInviteUrl(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin']);
	}

	viewSettings(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor', 'viewer']);
	}

	updateSettings(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner', 'admin', 'editor']);
	}

	async updateUserRole(
		actor: BouncerUser,
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		targetUser: Pick<TeamUserSchema, 'id'>,
		change: Pick<TeamUserSchema, 'role'>,
	): Promise<boolean> {
		const targetUserRole = await this.teamUserService.getUserRole(bouncer, team, targetUser);

		/** The roles allowed to perform this operation, or `false` if the operation is not allowed no matter what. */
		const allowedRolesOrFalse: false | TeamUserRole[] = match({
			from: targetUserRole.role,
			to: change.role,
		})
			// Owners can't be modified
			.with({ from: 'owner', to: P.any }, (): false => false)
			// An owner can make anyone into an owner or an admin
			.with({ from: P.any, to: P.union('owner', 'admin') }, (): TeamUserRole[] => ['owner'])
			// Only owner can manage admins
			.with({ from: 'admin', to: P.any }, (): TeamUserRole[] => ['owner'])
			// Owners & admins can manage editors & viewers
			.with({ from: P.union('editor', 'viewer'), to: P.union('editor', 'viewer') }, (): TeamUserRole[] => [
				'owner',
				'admin',
			])
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
		targetUser: Pick<TeamUserSchema, 'id'>,
	): Promise<boolean> {
		const targetUserRole = await this.teamUserService.getUserRole(bouncer, team, targetUser);

		const allowedRoles = rolesThatCanManageOther(targetUserRole);

		return this.authorizationService.hasRoles(actor, team, allowedRoles);
	}

	delete(actor: BouncerUser, team: Pick<TeamSchema, 'slug'>): AuthorizerResponse {
		return this.authorizationService.hasRoles(actor, team, ['owner']);
	}
}
