import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';

import { GuestPasswordService } from '../guest_password/guest_password_service.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamService } from '../team/team_service.js';
import { TeamManagerSchema } from '../team_manager/schemas/team_manager_schema.js';
import { TeamManagerService } from '../team_manager/team_manager_service.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';
import { MeetingRouter } from './meeting_router.js';
import { TeamManagerRouter } from './team_manager_router.js';
import { TeamMemberRouter } from './team_member_router.js';
import { TeamStatsRouter } from './team_stats_router.js';

@inject()
@injectHelper(
	TeamService,
	TeamMemberRouter,
	GuestPasswordService,
	TeamStatsRouter,
	MeetingRouter,
	TeamManagerService,
	TeamManagerRouter,
)
export class TeamRouter {
	constructor(
		private readonly teamService: TeamService,
		private readonly teamMemberRouter: TeamMemberRouter,
		private readonly teamStatsRouter: TeamStatsRouter,
		private readonly meetingRouter: MeetingRouter,
		private readonly teamManagerService: TeamManagerService,
		private readonly teamManagerRouter: TeamManagerRouter,
	) {}

	getRouter() {
		return router({
			members: this.teamMemberRouter.getRouter(),
			stats: this.teamStatsRouter.getRouter(),
			meetings: this.meetingRouter.getRouter(),
			managers: this.teamManagerRouter.getRouter(),

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
			join: authedProcedure
				.input(TeamSchema.pick({ inviteCode: true }).strict())
				.output(TeamSchema.pick({ slug: true }))
				.mutation(({ input, ctx }) => this.teamManagerService.joinTeam(input, ctx.user)),

			// TODO: Move to a new TeamSelfRouter (operations related to a team, for the current user)
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

			// TODO: Move to a new TeamSettingsRouter, consider splitting out TeamService as well
			getDisplayName: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.string())
				.query(({ input }) => {
					return this.teamService.getDisplayName(input);
				}),
			setDisplayName: authedProcedure
				.input(
					z.object({
						team: TeamSchema.pick({ slug: true }),
						data: TeamSchema.pick({ displayName: true }),
					}),
				)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.setDisplayName(ctx.context.bouncer, input.team, input.data);
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

			getInviteCode: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamSchema.pick({ inviteCode: true }))
				.query(({ ctx, input }) => {
					return this.teamService.getInviteCode(ctx.context.bouncer, input);
				}),

			resetInviteCode: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamSchema.pick({ inviteCode: true }))
				.mutation(({ ctx, input }) => {
					return this.teamService.resetInviteCode(ctx.context.bouncer, input);
				}),

			setSlug: authedProcedure
				.input(
					z.object({
						team: TeamSchema.pick({ slug: true }),
						data: TeamSchema.pick({ slug: true }),
					}),
				)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.setSlug(ctx.context.bouncer, input.team, input.data);
				}),
		});
	}
}
