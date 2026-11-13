import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.ts';
import { TeamSchema } from '../team/schemas/team_schema.ts';
import { TeamService } from '../team/team_service.ts';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.ts';

@inject()
@injectHelper(TeamService)
export class TeamSettingsRouter {
	constructor(private readonly teamService: TeamService) {}

	getRouter() {
		return router({
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
					return this.teamService.setDisplayName(ctx.actor, input.team, input.data);
				}),

			getPassword: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamSchema.pick({ password: true }))
				.query(({ ctx, input }) => {
					return this.teamService.getPassword(ctx.actor, input);
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
					return this.teamService.setPassword(ctx.actor, input.team, input.data);
				}),

			getInviteCode: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamSchema.pick({ inviteCode: true }))
				.query(({ ctx, input }) => {
					return this.teamService.getInviteCode(ctx.actor, input);
				}),
			resetInviteCode: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamSchema.pick({ inviteCode: true }))
				.mutation(({ ctx, input }) => {
					return this.teamService.resetInviteCode(ctx.actor, input);
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
					return this.teamService.setSlug(ctx.actor, input.team, input.data);
				}),
		});
	}
}
