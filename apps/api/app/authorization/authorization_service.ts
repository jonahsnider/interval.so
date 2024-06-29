import { inject } from '@adonisjs/core';
import type * as Schema from '#database/schema';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { GuestPasswordService } from '../guest_password/guest_password_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import { TeamMemberService } from '../team_member/team_member_service.js';
import { TeamUserService } from '../team_user/team_user_service.js';

export type TeamRole = Schema.TeamUserRole | 'guestToken';

@inject()
@injectHelper(GuestPasswordService, TeamUserService, TeamMemberService)
export class AuthorizationService {
	constructor(
		private readonly guestPasswordService: GuestPasswordService,
		private readonly teamUserService: TeamUserService,
		private readonly teamMemberService: TeamMemberService,
	) {}

	async hasRoles(
		actor: BouncerUser,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
		roles: TeamRole[],
	): Promise<boolean> {
		if (actor.id === undefined) {
			// No team user, so we can only check the guest token

			if (!roles.includes('guestToken')) {
				// Guest token wasn't a valid role, so we don't need to check the token

				return false;
			}

			// Check if the token is still valid
			return this.guestPasswordService.teamHasGuestToken(team, actor.unvalidatedGuestToken);
		}

		// Check if the DB contains any of the allowed roles
		return this.teamUserService.userHasRoleInTeam(
			actor,
			team,
			roles.filter((role): role is Schema.TeamUserRole => role !== 'guestToken'),
		);
	}

	/** Check whether an actor has a role by querying via team member. */
	async hasRolesByTeamMember(
		actor: BouncerUser,
		teamMember: Pick<TeamMemberSchema, 'id'>,
		roles: TeamRole[],
	): Promise<boolean> {
		// TODO: Rewrite this to do one query instead of two - I'm not optimizing for performance for the MVP

		const team = await this.teamMemberService.getTeamByMember(teamMember);

		if (!team) {
			// This should only ever be falsy if the team member ID doesn't exist anymore, and thus isn't associated with a team
			return false;
		}

		return this.hasRoles(actor, team, roles);
	}
}
