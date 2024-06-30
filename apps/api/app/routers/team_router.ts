import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';

import { GuestPasswordService } from '../guest_password/guest_password_service.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamService } from '../team/team_service.js';
import { TeamManagerSchema } from '../team_user/schemas/team_user_schema.js';
import { TeamManagerService } from '../team_user/team_manager_service.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';
import { MeetingRouter } from './meeting_router.js';
import { TeamMemberRouter } from './team_member_router.js';
import { TeamStatsRouter } from './team_stats_router.js';

@inject()
@injectHelper(TeamService, TeamMemberRouter, GuestPasswordService, TeamStatsRouter, MeetingRouter, TeamManagerService)
export class TeamRouter {
	constructor(
		private readonly teamService: TeamService,
		private readonly teamMemberRouter: TeamMemberRouter,
		private readonly teamStatsRouter: TeamStatsRouter,
		private readonly meetingRouter: MeetingRouter,
		private readonly teamManagerService: TeamManagerService,
	) {}

	getRouter() {
		return router({
			members: this.teamMemberRouter.getRouter(),
			stats: this.teamStatsRouter.getRouter(),
			meetings: this.meetingRouter.getRouter(),

			teamNamesForSelf: authedProcedure
				.output(TeamSchema.pick({ displayName: true, slug: true }).array())
				.query(({ ctx }) => {
					return this.teamManagerService.teamNamesForUser(ctx.user);
				}),
			roleForSelf: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamManagerSchema.pick({ role: true }))
				.query(({ ctx, input }) => {
					return this.teamManagerService.getUserRole(ctx.context.bouncer, input, ctx.user);
				}),
			leave: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamManagerService.leave(ctx.context.bouncer, input, ctx.user);
				}),

			create: authedProcedure
				.input(TeamSchema.pick({ displayName: true, password: true, slug: true }))
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

			delete: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.delete(ctx.context.bouncer, input);
				}),

			getPassword: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamSchema.pick({ password: true }))
				.query(({ ctx, input }) => {
					return this.teamService.getPassword(ctx.context.bouncer, input);
				}),

			setPassword: authedProcedure
				.input(
					z
						.object({
							team: TeamSchema.pick({ slug: true }),
							data: TeamSchema.pick({ password: true }),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.setPassword(ctx.context.bouncer, input.team, input.data);
				}),
		});
	}
}
