import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamService } from '../team/team_service.js';
import { TeamManagerSchema } from '../team_manager/schemas/team_manager_schema.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';
import { TeamForUserRouter } from './team_for_user_router.js';
import { TeamManagerRouter } from './team_manager_router.js';
import { TeamMeetingRouter } from './team_meeting_router.js';
import { TeamMemberRouter } from './team_member_router.js';
import { TeamSettingsRouter } from './team_settings_router.js';
import { TeamStatsRouter } from './team_stats_router.js';

@inject()
@injectHelper(
	TeamService,
	TeamMemberRouter,
	TeamStatsRouter,
	TeamMeetingRouter,
	TeamManagerRouter,
	TeamSettingsRouter,
	TeamForUserRouter,
)
export class TeamRouter {
	constructor(
		private readonly teamService: TeamService,
		private readonly teamMemberRouter: TeamMemberRouter,
		private readonly teamStatsRouter: TeamStatsRouter,
		private readonly meetingRouter: TeamMeetingRouter,
		private readonly teamManagerRouter: TeamManagerRouter,
		private readonly teamSettingsRouter: TeamSettingsRouter,
		private readonly teamForUserRouter: TeamForUserRouter,
	) {}

	getRouter() {
		return router({
			members: this.teamMemberRouter.getRouter(),
			stats: this.teamStatsRouter.getRouter(),
			meetings: this.meetingRouter.getRouter(),
			managers: this.teamManagerRouter.getRouter(),
			settings: this.teamSettingsRouter.getRouter(),
			forUser: this.teamForUserRouter.getRouter(),

			getByInviteCode: publicProcedure
				.input(TeamSchema.pick({ inviteCode: true }).strict())
				.output(
					z.object({
						team: TeamSchema.pick({ displayName: true }),
						owner: TeamManagerSchema.shape.user.pick({ displayName: true }),
					}),
				)
				.query(({ input }) => {
					return this.teamService.getTeamByInviteCode(input);
				}),

			create: authedProcedure
				.input(TeamSchema.pick({ displayName: true, password: true, slug: true }))
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.create(input, ctx.user);
				}),

			delete: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.delete(ctx.bouncer, input);
				}),
		});
	}
}
