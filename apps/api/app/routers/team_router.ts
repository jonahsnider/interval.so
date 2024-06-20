import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';

import { GuestPasswordService } from '../guest_password/guest_password_service.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamService } from '../team/team_service.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';
import { MeetingRouter } from './meeting_router.js';
import { TeamMemberRouter } from './team_member_router.js';
import { TeamStatsRouter } from './team_stats_router.js';

@inject()
@injectHelper(TeamService, TeamMemberRouter, GuestPasswordService, TeamStatsRouter, MeetingRouter)
export class TeamRouter {
	constructor(
		private readonly teamService: TeamService,
		private readonly teamMemberRouter: TeamMemberRouter,
		private readonly teamStatsRouter: TeamStatsRouter,
		private readonly meetingRouter: MeetingRouter,
	) {}

	getRouter() {
		return router({
			members: this.teamMemberRouter.getRouter(),
			stats: this.teamStatsRouter.getRouter(),
			meetings: this.meetingRouter.getRouter(),

			teamNamesForSelf: authedProcedure
				.output(TeamSchema.pick({ displayName: true, slug: true }).array())
				.query(({ ctx }) => {
					return this.teamService.teamNamesForUser(ctx.user);
				}),
			create: authedProcedure
				.input(TeamSchema)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.create(input, ctx.user);
				}),

			getDisplayName: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.string())
				.query(({ input }) => {
					return this.teamService.getDisplayName(input);
				}),
		});
	}
}
